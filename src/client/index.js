const fs = require('fs')
const path = require('path')
const tmpl = require('blueimp-tmpl')
const WebSocket = require('ws')
const Koa = require('koa')
const app = new Koa()

const port = process.env.PORT || 8080
const rootPath = process.env.ROOT_PATH || '/'

const streams = {}
const offsets = {}
const clients = {}

const websocket = new WebSocket.Server({ noServer: true })
websocket.on('connection', (ws, request) => {
  const key = request.url
  if (!clients[key]) {
    clients[key] = []

    const realfile = path.join(rootPath, request.url)
    fs.watch(realfile, () => {
      console.log(offsets, key)
      const offset = offsets[key] || 0

      /* TODO offset erro
      fs.readSync(fd, buffer, 0, 1000)
      content = buffer.toString('utf8')
      const buffer = Buffer.from('', 'utf8')
      const fd = fs.openSync(realfile, 'r')
      */
      const content = fs.readFileSync(realfile, { encoding: 'utf8' })

      offsets[key] = offset + Buffer.byteLength(content)

      if (clients[key]) {
        clients[key].forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(content)
          }
        })
      }
    })
  }
  clients[key].push(ws)

  ws.on('message', (data) => {
    ws.send(`length: ${data.length}`)
  })
})

app.use(async ctx => {
  const html = fs.readFileSync('./public/index.html', { encoding: 'utf8' })

  const filePath = ctx.request.path
  const key = filePath
  const realfile = path.join(rootPath, filePath)

  const content = fs.readFileSync(realfile)
  offsets[key] = Buffer.byteLength(content)

  const data = {
    title: ctx.response.path,
    stats: fs.statSync(realfile),
    realfile,
    extension: path.extname(realfile),
    content,
  }
  ctx.body = tmpl(html, data)
})


const handle = app.listen(port, () => {
  console.log(`app listen at ${port}`)
})

handle.on('upgrade', (request, socket, head) => {
  websocket.handleUpgrade(request, socket, head, (ws) => {
    websocket.emit('connection', ws, request)
  })
})
