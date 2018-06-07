const url = require('url')
const path = require('path')

const FileDriver = require('./file')

class DriverFactory {
  constructor(path) {
    this.parse = url.parse(path)
    this.params = new URLSearchParams(this.parse.query)
  }

  getKey() {
    return this.parse.pathname
  }

  getInstance(uri) {
    let instance

    const extname = path.extname(this.parse.pathname).slice(1)
    switch (extname) {
      case 'txt':
      case 'log':
      default:
        instance = new TextDriver(this.parse.pathname, this.params)
        break
    }

    return instance
  }
}

module.exports = DriverFactory
