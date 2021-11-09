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

  await fetch(url)
    .then(async response => {
      if (response.status < 400) {
        const buffer = await response.arrayBuffer()
        return unpackResources(buffer)
      } else {
        throw new Error('Failed to fetch resources: ' + response.status)
      }
    })
}

function unpackResources (buffer) {
  inflate.push(new Uint8Array(buffer))
  const ungzipped = inflate.result
  untar(ungzipped.buffer)
    .then(extractedFiles => {
      //
      console.log(extractedFiles)
      //
      parseManifest(extractedFiles.find(e => e.name === 'resources/Manifest').buffer)
      return extractedFiles
    })
}

function parseManifest (manifestFile) {
  const decoder = new TextDecoder()
  const manifest = decoder.decode(manifestFile).split('\n')
  manifest.pop()
  manifest.forEach(e => {
    const line = e.split(':')
    //
    console.log(line)
    //
  })
}

export {
  fetchResources,
  unpackResources,
  parseManifest
}
