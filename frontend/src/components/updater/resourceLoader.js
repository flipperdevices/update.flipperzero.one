import untar from 'js-untar'
import pako from 'pako'
const inflate = new pako.Inflate()
import * as pbCommands from './protobuf/commands'

async function fetchResources (channel, files) {
  const file = files.find(e => {
    if (e.type === 'resources_tgz') return e
    else return undefined
  })
  let url = file.url
  if (channel === 'dev') {
    url = 'https://update.flipperzero.one/firmware/development/any/resources_tgz'
  }

  return await fetch(url)
    .then(async response => {
      if (response.status >= 400) {
        throw new Error('Failed to fetch resources: ' + response.status)
      }
      const buffer = await response.arrayBuffer()
      return unpackResources(buffer)
    })
}

function unpackResources (buffer) {
  inflate.push(new Uint8Array(buffer))
  const ungzipped = inflate.result
  return untar(ungzipped.buffer)
    .then(extractedFiles => {
      return extractedFiles
    })
}

function parseManifest (manifestFile) {
  const decoder = new TextDecoder()

  const manifest = {
    version: undefined,
    timestamp: undefined,
    storage: {}
  }
  function addDirectory (level, path, fullPath) {
    if (path.length) {
      if (level[path[0]] === undefined) {
        level[path[0]] = {
          type: 1,
          fullPath: fullPath
        }
      }
      const nextLevel = level[path[0]]
      path.shift()
      return addDirectory(nextLevel, path, fullPath)
    }
  }
  function addFile (md5, size, path) {
    const name = path.pop()
    let currentLevel = manifest.storage
    path.forEach(l => {
      if (currentLevel[l] === undefined) {
        currentLevel[l] = {
          type: 1
        }
      }
      currentLevel = currentLevel[l]
    })
    currentLevel[name] = {
      type: 0,
      md5: md5,
      size: size,
      fullName: path.join('/') + '/' + name
    }
  }

  try {
    const raw = decoder.decode(manifestFile).split('\n')
    raw.pop()
    raw.forEach(e => {
      const line = e.split(':')
      switch (line[0]) {
        case 'V':
          manifest.version = line[1]
          break
        case 'T':
          manifest.timestamp = line[1]
          break
        case 'D':
          addDirectory(manifest.storage, line[1].split('/'), line[1])
          break
        case 'F':
          addFile(line[1], line[2], line[3].split('/'))
          break
      }
    })
  } catch (error) {
    return 'invalid manifest'
  }
  return manifest
}

function compareManifests (flipperManifest, fetchedManifest, resources) {
  const queue = []

  function lookup (fetchedLevel, flipperLevel) {
    Object.keys(fetchedLevel).forEach(k => {
      if (k !== 'type' && k !== 'fullPath') {
        if (flipperLevel[k] === undefined) {
          if (fetchedLevel[k].type === 0) {
            const file = resources.find(e => e.name === fetchedLevel[k].fullName)
            queue.push({
              command: 'storageWrite',
              path: '/ext/' + fetchedLevel[k].fullName,
              buffer: file.buffer
            })
          } else {
            queue.push({
              command: 'storageMkdir',
              path: '/ext/' + fetchedLevel[k].fullPath
            })
            flipperLevel[k] = {}
            lookup(fetchedLevel[k], flipperLevel[k])
          }
        } else {
          if (flipperLevel[k].type === fetchedLevel[k].type) {
            if (fetchedLevel[k].type === 0) {
              if (flipperLevel[k].md5 !== fetchedLevel[k].md5) {
                queue.push({
                  command: 'storageDelete',
                  path: '/ext/' + fetchedLevel[k].fullName,
                  isRecursive: false
                })

                const file = resources.find(e => e.name === fetchedLevel[k].fullName)
                queue.push({
                  command: 'storageWrite',
                  path: '/ext/' + fetchedLevel[k].fullName,
                  buffer: file.buffer
                })
              }
            } else {
              lookup(fetchedLevel[k], flipperLevel[k])
            }
          } else {
            if (flipperLevel[k].type === 0) {
              queue.push({
                command: 'storageDelete',
                path: '/ext/' + flipperLevel[k].fullName,
                isRecursive: false
              })
            } else {
              queue.push({
                command: 'storageDelete',
                path: '/ext/' + flipperLevel[k].fullName,
                isRecursive: true
              })
            }

            if (fetchedLevel[k].type === 0) {
              const file = resources.find(e => e.name === fetchedLevel[k].fullName)
              queue.push({
                command: 'storageWrite',
                path: '/ext/' + fetchedLevel[k].fullName,
                buffer: file.buffer
              })
            } else {
              queue.push({
                command: 'storageMkdir',
                path: '/ext/' + fetchedLevel[k].fullPath
              })

              flipperLevel[k] = {}
              lookup(fetchedLevel[k], flipperLevel[k])
            }
          }
        }
      }
    })
  }

  lookup(fetchedManifest.storage, flipperManifest.storage)

  const file = resources.find(e => e.name === 'Manifest')
  queue.push({
    command: 'storageWrite',
    path: '/ext/Manifest',
    buffer: file.buffer
  })

  queue.push({
    command: 'stopRpcSession'
  })
  return queue
}

async function writeQueue (queue) {
  const globalStart = Date.now()
  for (const entry of queue) {
    let req
    const start = Date.now()
    console.log('command:', entry)
    switch (entry.command) {
      case 'storageMkdir':
        req = pbCommands.storageMkdir(entry.path)
        break
      case 'storageWrite':
        req = pbCommands.storageWrite(entry.path, entry.buffer)
        break
      case 'storageDelete':
        req = pbCommands.storageDelete(entry.path, entry.isRecursive)
        break
      case 'stopRpcSession':
        req = pbCommands.stopRpcSession()
        break
    }
    if (req) {
      await req
        .then(res => {
          console.log('response (' + (Date.now() - start) + 'ms):', res)
        })
    }
  }
  console.log('Resources loaded in ' + (Date.now() - globalStart) + ' ms')
}

export {
  fetchResources,
  unpackResources,
  parseManifest,
  compareManifests,
  writeQueue
}
