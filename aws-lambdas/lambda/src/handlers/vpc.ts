const https = require('https')

exports.handler = async function () {
  const res:any = await fetch('https://api.chucknorris.io/jokes/random')
  const randomFact = JSON.parse(res).value

  return randomFact
}

async function fetch(url:any) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 1000 }, (res:any) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`))
      }

      const body:any[] = []
      res.on('data', (chunk:any) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(resString)
      })
    })

    request.on('error', (err:any) => reject(err))
    request.on('timeout', (err:any) => {
      console.log('timed out', err)
      reject(err)
    })
  })
}

export {}
