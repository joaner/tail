const fs = require('fs')
const path = require('path')
const tmpl = require('blueimp-tmpl')
const url = require('url')
const WebSocket = require('ws')
const Koa = require('koa')
const app = new Koa()

const port = process.env.PORT || 8080
const rootPath = process.env.ROOT_PATH || '/'

const streams = {}
const offsets = {}
const clients = {}

const MAX_READ_LENGTH = 1000

const websocket = new WebSocket.Server({ noServer: true })
websocket.on('connection', (ws, request) => {
  const parse = url.parse(request.url)
  const params = new URLSearchParams(parse.query)

  const key = parse.pathname
  if (!clients[key]) {
    clients[key] = []

    const realfile = path.join(rootPath, parse.pathname)
    fs.watch(realfile, () => {
      const fd = Number(params.get('fd'))
      const buffer = Buffer.alloc(MAX_READ_LENGTH)
      const length = fs.readSync(fd, buffer, 0, MAX_READ_LENGTH, null)
      content = buffer.slice(0, length).toString('utf8')

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

  const fd = fs.openSync(realfile, 'r')
  const buffer = Buffer.alloc(MAX_READ_LENGTH)
  const length = fs.readSync(fd, buffer, 0, MAX_READ_LENGTH, null)

  content = buffer.slice(0, length).toString('utf8')
  offsets[key] = buffer.length

  const data = {
    title: ctx.response.path,
    stats: fs.statSync(realfile),
    fd,
    realfile,
    extname: path.extname(realfile),
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
