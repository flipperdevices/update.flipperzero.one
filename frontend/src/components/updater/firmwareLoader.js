import shajs from 'sha.js'
import crc32 from 'crc-32'

async function fetchFirmwareFile (channel, files, target) {
  const file = files.find((e) => {
    if (e.type === 'full_dfu' && (e.target === 'f' + target || !e.target)) return e
    else return undefined
  })
  let url = file.url
  if (channel === 'dev') {
    url = 'https://update.flipperzero.one/firmware/development/f' + target + '/full_dfu'
  }

  const buffer = await fetch(url)
    .then(response => {
      return response.arrayBuffer()
    })
  const firmwareFile = new Uint8Array(buffer)

  const calculatedSha256 = await shajs('sha256').update(firmwareFile).digest('hex')
  if (!file.sha256 || file.sha256 === calculatedSha256) {
    return cropDFUFile(firmwareFile, target)
  } else {
    throw new Error('SHA256 check failed')
  }
}

async function loadFirmwareFile (file, target) {
  const buffer = await file.arrayBuffer()
  const firmwareFile = new Uint8Array(buffer)
  return cropDFUFile(firmwareFile, target)
}

function cropDFUFile (firmwareFile, target) {
  let targetCheck, crc32Check
  function toHex (f, s, e) {
    return Array.from(f.slice(s, e), (byte) => {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2)
    }).join(' ')
  }

  const parsedTarget = new TextDecoder().decode(firmwareFile.slice(22, 37))
  if (parsedTarget.endsWith(target)) {
    targetCheck = true
  } else {
    targetCheck = false
  }

  const startAddress = toHex(firmwareFile, 285, 289).split(' ').reverse().join('')

  const size = parseInt(toHex(firmwareFile, 289, 293).split(' ').reverse().join(''), 16)
  const binary = firmwareFile.slice(293, size + 293)

  const parsedCrc32 = new Int32Array(firmwareFile.slice(firmwareFile.length - 4, firmwareFile.length).buffer)[0]
  const calculatedCrc32 = crc32.buf(firmwareFile.slice(0, firmwareFile.length - 4))
  if ((-parsedCrc32 - 1) !== calculatedCrc32) {
    crc32Check = false
  } else {
    crc32Check = true
  }

  return { binary, startAddress, targetCheck, crc32Check }
}

export {
  fetchFirmwareFile,
  loadFirmwareFile,
  cropDFUFile
}
