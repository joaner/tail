const fs = require('fs')
const path = require('path')
const tmpl = require('blueimp-tmpl')
const DriverFactory = require('./drivers/factory')
const WebSocket = require('ws')
const Koa = require('koa')
const app = new Koa()

const port = process.env.PORT || 8080

const streams = {}
const clients = {}

const MAX_READ_LENGTH = 1000

const websocket = new WebSocket.Server({ noServer: true })
websocket.on('connection', (ws, request) => {
  const factory = new DriverFactory(request.url)
  const key = factory.getKey()
  if (!clients[key]) {
    clients[key] = []
  }
  clients[key].push(ws)

  ws.on('message', (data) => {
    ws.send(`length: ${data.length}`)
  })
})

app.use(async ctx => {
  const html = fs.readFileSync('./public/index.html', { encoding: 'utf8' })

  const factory = new DriverFactory(ctx.request.path)
  const key = factory.getKey()

  const driver = factory.getInstance()

  driver.watch((content) => {
    if (clients[key]) {
      clients[key].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(content)
        }
      })
    }
  })

  const data = {
    title: ctx.response.path,
    uri: driver.getURI(),
    name: driver.getName(),
    realfile: key,
    content: driver.read(),
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
