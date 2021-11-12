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
  console.log('flipperManifest', flipperManifest)
  console.log('fetchedManifest', fetchedManifest)

  const queue = []

  function lookup (fetchedLevel, flipperLevel) {
    Object.keys(fetchedLevel).forEach(k => {
      if (k !== 'type' && k !== 'fullPath') {
        if (flipperLevel[k] === undefined) {
          // path not found, check type on *fetched*
          if (fetchedLevel[k].type === 0) {
            // !-> storageWriteRequest
            console.log(fetchedLevel[k].fullName, '-> storageWriteRequest')

            const file = resources.find(e => e.name === fetchedLevel[k].fullName)
            // !await pbCommands.storageWrite('/ext/' + fetchedLevel[k].fullName, file.buffer)
            queue.push({
              command: 'storageWrite',
              path: '/ext/' + fetchedLevel[k].fullName,
              buffer: file.buffer
            })
          } else {
            // !-> storageMkdirRequest
            console.log(fetchedLevel[k].fullPath, '-> storageMkdirRequest')

            // !await pbCommands.storageMkdir('/ext/' + fetchedLevel[k].fullPath)
            queue.push({
              command: 'storageMkdir',
              path: '/ext/' + fetchedLevel[k].fullPath
            })

            flipperLevel[k] = {}
            // created directory, go deeper
            console.log(fetchedLevel[k].fullPath, 'created directory, go deeper')
            lookup(fetchedLevel[k], flipperLevel[k])
          }
        } else {
          // path found, check that types match
          if (flipperLevel[k].type === fetchedLevel[k].type) {
            if (fetchedLevel[k].type === 0) {
              // it's a file, now check for md5
              if (flipperLevel[k].md5 !== fetchedLevel[k].md5) {
                // !file changed -> storageDeleteRequest & storageWriteRequest
                console.log(fetchedLevel[k].fullName, 'file changed -> storageDeleteRequest & storageWriteRequest')

                // !await pbCommands.storageDelete('/ext/' + fetchedLevel[k].fullName, false)
                queue.push({
                  command: 'storageDelete',
                  path: '/ext/' + fetchedLevel[k].fullName,
                  isRecursive: false
                })

                const file = resources.find(e => e.name === fetchedLevel[k].fullName)
                // !await pbCommands.storageWrite('/ext/' + fetchedLevel[k].fullName, file.buffer)
                queue.push({
                  command: 'storageWrite',
                  path: '/ext/' + fetchedLevel[k].fullName,
                  buffer: file.buffer
                })
              }
            } else {
              // it's a directory, go deeper
              lookup(fetchedLevel[k], flipperLevel[k])
            }
          } else {
            // !type mismatch -> storageDeleteRequest
            console.log(k, 'type mismatch -> storageDeleteRequest')

            if (flipperLevel[k].type === 0) {
              console.log(k, 'deleting file')
              // !await pbCommands.storageDelete('/ext/' + flipperLevel[k].fullName, false)
              queue.push({
                command: 'storageDelete',
                path: '/ext/' + flipperLevel[k].fullName,
                isRecursive: false
              })
            } else {
              console.log(k, 'deleting dir')
              // !await pbCommands.storageDelete('/ext/' + flipperLevel[k].fullPath, true)
              queue.push({
                command: 'storageDelete',
                path: '/ext/' + flipperLevel[k].fullName,
                isRecursive: true
              })
            }

            if (fetchedLevel[k].type === 0) {
              // !-> storageWriteRequest
              console.log(fetchedLevel[k].fullName, '-> storageWriteRequest')

              const file = resources.find(e => e.name === fetchedLevel[k].fullName)
              // !await pbCommands.storageWrite('/ext/' + fetchedLevel[k].fullName, file.buffer)
              queue.push({
                command: 'storageWrite',
                path: '/ext/' + fetchedLevel[k].fullName,
                buffer: file.buffer
              })
            } else {
              // !-> storageMkdirRequest
              console.log(fetchedLevel[k].fullPath, '-> storageMkdirRequest')

              // !await pbCommands.storageMkdir('/ext/' + fetchedLevel[k].fullPath)
              queue.push({
                command: 'storageMkdir',
                path: '/ext/' + fetchedLevel[k].fullPath
              })

              flipperLevel[k] = {}
              // created directory, go deeper
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
  const delays = [0]
  queue.forEach(async (e, i) => {
    console.log(i + 3 + ' :', e.command, e.path, delays[i], '(adds', Math.ceil((e.buffer ? e.buffer.byteLength / 512 : 0) * 450) + 750, 'ms)')
    setTimeout(async () => {
      let res
      const start = Date.now()
      console.log('starting', e)
      switch (e.command) {
        case 'storageMkdir':
          res = await pbCommands.storageMkdir(e.path)
          break
        case 'storageWrite':
          res = await pbCommands.storageWrite(e.path, e.buffer)
          break
        case 'storageDelete':
          res = await pbCommands.storageDelete(e.path, e.isRecursive)
          break
      }
      console.log('response (', Date.now() - start, 'ms):', res)
      if (res && res.error) {
        console.log(res.error)
      }
    }, delays[i])

    delays.push(delays[i] + 750)
    if (e.buffer) {
      delays[i + 1] += Math.ceil((e.buffer.byteLength / 512) * 450)
    }
  })
}

export {
  fetchResources,
  unpackResources,
  parseManifest,
  compareManifests,
  writeQueue
}
