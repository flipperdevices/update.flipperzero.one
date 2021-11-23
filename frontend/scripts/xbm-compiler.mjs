import { readdir } from 'fs/promises'
import { readFileSync, writeFileSync } from 'fs'

const path = './src/assets/screens/xbm'

async function list () {
  const converted = {}

  try {
    const files = await readdir(path)
    for (const file of files) {
      converted[file.slice(0, -4)] = convert(file)
    }
  } catch (err) {
    console.error(err)
  }

  writeFileSync('./src/components/updater/protobuf/xbms.js', 'export default ' + JSON.stringify(converted))
}

function convert (file) {
  const buffer = readFileSync(path + '/' + file)
  const fileContent = buffer.toString()

  const matches = fileContent.matchAll(/0x\w\w/g)
  const bytes = []
  for (const match of matches) {
    bytes.push(Number(match))
  }

  return bytes
}

list()
