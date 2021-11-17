import untar from 'js-untar'
import pako from 'pako'
const inflate = new pako.Inflate()
import * as pbCommands from './protobuf/commands'
import { emitter } from './core'

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
              command: 'write',
              path: '/ext/' + fetchedLevel[k].fullName,
              buffer: file.buffer
            })
          } else {
            queue.push({
              command: 'mkdir',
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
                  command: 'delete',
                  path: '/ext/' + fetchedLevel[k].fullName,
                  isRecursive: false
                })

                const file = resources.find(e => e.name === fetchedLevel[k].fullName)
                queue.push({
                  command: 'write',
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
                command: 'delete',
                path: '/ext/' + flipperLevel[k].fullName,
                isRecursive: false
              })
            } else {
              queue.push({
                command: 'delete',
                path: '/ext/' + flipperLevel[k].fullName,
                isRecursive: true
              })
            }

            if (fetchedLevel[k].type === 0) {
              const file = resources.find(e => e.name === fetchedLevel[k].fullName)
              queue.push({
                command: 'write',
                path: '/ext/' + fetchedLevel[k].fullName,
                buffer: file.buffer
              })
            } else {
              queue.push({
                command: 'mkdir',
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
    command: 'write',
    path: '/ext/Manifest',
    buffer: file.buffer
  })
  return queue
}

async function commandQueue (queue) {
  let i = 0
  for (const entry of queue) {
    i++
    let req
    const start = Date.now()
    switch (entry.command) {
      case 'mkdir':
        req = pbCommands.storageMkdir(entry.path)
        break
      case 'write':
        req = pbCommands.storageWrite(entry.path, entry.buffer)
        break
      case 'delete':
        req = pbCommands.storageDelete(entry.path, entry.isRecursive)
        break
      case 'stop session':
        req = pbCommands.stopRpcSession()
        break
    }
    if (req) {
      emitter.emit('commandQueue/progress', {
        index: i,
        name: entry.command,
        path: entry.path,
        status: 'in progress'
      })
      await req
        .then(res => {
          emitter.emit('commandQueue/progress', {
            index: i,
            time: Date.now() - start,
            name: entry.command,
            path: entry.path,
            status: res && res.error ? res.error : 'ok'
          })
        })
    }
  }
}

async function readDir (path) {
  const files = await pbCommands.storageList(path)
  for (const file of files) {
    file.path = path + '/' + file.name
    if (file.type !== 1) {
      file.data = await pbCommands.storageRead(file.path)
    } else {
      file.files = await readDir(file.path)
    }
  }
  return files
}

function enqueueWriteDir (files, queue) {
  for (const file of files) {
    if (file.type !== 1) {
      queue.push({
        command: 'write',
        path: file.path,
        buffer: file.data
      })
    } else {
      queue = enqueueWriteDir(file.files, queue)
    }
  }
  return queue
}

async function readInternalStorage () {
  emitter.emit('readInternalStorage', 'start')
  const internal = await readDir('/int')
  emitter.emit('readInternalStorage', 'end')
  return internal
}

async function writeInternalStorage (files) {
  emitter.emit('writeInternalStorage', 'start')
  const flipperFiles = await pbCommands.storageList('/int')
  let queue = []

  if (flipperFiles !== 'empty response') {
    flipperFiles.forEach(f => {
      const command = {
        command: 'delete',
        path: '/int/' + f.name
      }
      if (f.type === 1) {
        command.isRecursive = true
      }
      queue.push(command)
    })
  }

  queue = enqueueWriteDir(files, queue)

  queue.push({
    command: 'stop session'
  })
  await commandQueue(queue)
  emitter.emit('writeInternalStorage', 'end')
}

export {
  fetchResources,
  unpackResources,
  parseManifest,
  compareManifests,
  commandQueue,
  readInternalStorage,
  writeInternalStorage
}
