const fs = require('fs')
const path = require('path')
const BaseDriver = require('./base')

const ROOT_PATH = process.env.ROOT_PATH || '/'
const MAX_READ_LENGTH = 1000

class FileDriver extends BaseDriver {
  constructor(pathname, options = {}) {
    super()

    this.path = pathname
    this.file = path.join(ROOT_PATH, pathname)

    if (!options.fd) {
      options.fd = fs.openSync(this.file, 'r')
    }
    this.options = options
  }

  getName() {
    return 'file'
  }

  watch(cb) {
    fs.watch(this.file, () => {
      const buffer = Buffer.alloc(MAX_READ_LENGTH)
      const length = fs.readSync(this.options.fd, buffer, 0, MAX_READ_LENGTH, null)
      const content = buffer.slice(0, length).toString('utf8')

      cb(content)
    })
  }

  unwatch(cb) {
    fs.unwatchFile(this.file)
  }

  read() {
    const buffer = Buffer.alloc(MAX_READ_LENGTH)
    const length = fs.readSync(this.options.fd, buffer, 0, MAX_READ_LENGTH, null)

    return buffer.slice(0, length).toString('utf8')
  }

  getURI() {
    return `${this.path}?fd=${this.options.fd}`
  }
}

module.exports = FileDriver
