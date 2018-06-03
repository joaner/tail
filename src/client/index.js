const fs = require('fs')
const path = require('path')
const net = require('net')
const tmpl = require('blueimp-tmpl')
const Koa = require('koa')
const app = new Koa()

const port = process.env.PORT || 8080
const rootPath = process.env.ROOT_PATH || '/'

const socket = new net.Server((sock) => {
  console.log(sock)
})

app.use(async ctx => {
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

socket.listen(port, (handle) => {
  // TODO 两个服务监听统一端口，目前net.Server会覆盖koa
  app.listen(port + 1, () => {
    console.log(`app listen at ${port}`)
  })
})
