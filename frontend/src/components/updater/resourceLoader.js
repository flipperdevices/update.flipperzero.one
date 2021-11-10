import untar from 'js-untar'
import pako from 'pako'
const inflate = new pako.Inflate()

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
  const raw = decoder.decode(manifestFile).split('\n')

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
  return manifest
}

function compareManifests (flipperManifest, fetchedManifest) {
  console.log('flipperManifest', flipperManifest)
  console.log('fetchedManifest', fetchedManifest)
  function lookup (fetchedLevel, flipperLevel) {
    Object.keys(fetchedLevel).forEach(k => {
      if (k !== 'type' && k !== 'fullPath') {
        if (flipperLevel[k] === undefined) {
          // path not found, check type on *fetched*
          console.log(k, 'path not found, check type on *fetched*')
          if (fetchedLevel[k].type === 0) {
            // -> storageWriteRequest
            console.log(fetchedLevel[k].fullName, '-> storageWriteRequest')
          } else {
            // -> storageMkdirRequest
            console.log(fetchedLevel[k].fullPath, '-> storageMkdirRequest')
          }
        } else {
          // path found, check that types match
          console.log(k, 'path found, check that types match')
          if (flipperLevel[k].type === fetchedLevel[k].type) {
            if (fetchedLevel[k].type === 0) {
              // it's a file, now check for md5
              console.log(fetchedLevel[k].fullName, 'is a file, now check for md5')
              if (flipperLevel[k].md5 !== fetchedLevel[k].md5) {
                // file changed -> storageDeleteRequest & storageWriteRequest
                console.log(fetchedLevel[k].fullName, 'file changed -> storageDeleteRequest & storageWriteRequest')
              }
            } else {
              // it's a directory, go deeper
              console.log(fetchedLevel[k].fullPath, 'is a directory, go deeper')
              lookup(fetchedLevel[k], flipperLevel[k])
            }
          } else {
            // type mismatch -> storageDeleteRequest
            console.log(k, 'type mismatch -> storageDeleteRequest')
            if (fetchedLevel[k].type === 0) {
              // -> storageWriteRequest
              console.log(fetchedLevel[k].fullName, '-> storageWriteRequest')
            } else {
              // -> storageMkdirRequest
              console.log(fetchedLevel[k].fullPath, '-> storageMkdirRequest')
            }
          }
        }
      }
    })
  }
  lookup(fetchedManifest.storage, flipperManifest.storage)
}

export {
  fetchResources,
  unpackResources,
  parseManifest,
  compareManifests
}
