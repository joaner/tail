const net = require('net')
const url = require('url')
const BaseDriver = require('./base')
const MAX_READ_LENGTH = 1000

class NetcatDriver extends BaseDriver {
  constructor(pathname, options) {
    super()

    this.parse = url.parse(pathname)

    if (!options.fd) {
      options.fd = fs.openSync(this.file, 'r')
    }
    this.options = options
  }

  watch(cb) {
    this.server = net.createServer((socket) => {
      socket.on('message', cb)
    }).listen(this.parse.port, this.parse.hostname)
  }

  unwatch(cb) {
    this.server.close(cb)
  }
}

module.exports = NetcatDriver
