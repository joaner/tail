const fs = require('fs')
const path = require('path')
const tmpl = require('blueimp-tmpl')
const WebSocket = require('ws')
const Koa = require('koa')
const app = new Koa()

const port = process.env.PORT || 8080
const rootPath = process.env.ROOT_PATH || '/'

const websocket = new WebSocket.Server({ noServer: true })
websocket.on('connection', (ws) => {
  ws.on('message', (data) => {
    ws.send(`length: ${data.length}`)
  })
})

app.use(async ctx => {
  if (ctx.originalUrl === '/socket') {
    return
  }

  const html = fs.readFileSync('./public/index.html', { encoding: 'utf8' })

  const filePath = ctx.request.path
  const realfile = path.resolve(rootPath, filePath)
  const data = {
    title: ctx.response.path,
    stats: fs.statSync(realfile),
    realfile,
    extension: path.extname(realfile),
    content: fs.readFileSync(realfile)
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
