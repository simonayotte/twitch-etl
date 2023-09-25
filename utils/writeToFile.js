import fs from 'fs'

export async function writeToFile(data) {
  let file = 'data/streams_' + Date.now() + '.json'
  fs.writeFile(file, data, 'utf-8', (err) => {
    if (err) {
      console.error('Error writing file:', err)
    } else {
      console.log('Data written to file:', file)
    }
  })
}
