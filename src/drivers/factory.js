const url = require('url')
const path = require('path')

const FileDriver = require('./file')
const NetcatDriver = require('./netcat')

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

    if (this.parse.pathname.indexOf('netcat:') === 1) {
      instance = new NetcatDriver(this.parse.pathname, this.params)
    } else {
      instance = new FileDriver(this.parse.pathname, this.params)
    }

    return instance
  }
}

module.exports = DriverFactory
