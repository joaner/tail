const BaseFormat = require('./base')

class TextFormat extends BaseFormat {
  constructor(options) {
    this.offset = 1
    this.container = options.container
  }

  render(data) {
    const lines = data.split("\n")

    const content = this.container
    if (content.lastChild) {
      const first = lines.shift()
      content.lastChild.textContent += first

      content.lastChild.style.display = null

      this.offset = content.children.length
    }
    const fragment = document.createDocumentFragment()
    lines.forEach((line, key) => {
      const row = document.createElement('tr')
      const num = document.createElement('th')
      num.textContent = offset + key
      const txt = document.createElement('td')
      txt.textContent = line

      row.appendChild(num)
      row.appendChild(txt)

      if (!line) {
        row.style.display = 'none'
      }
      fragment.appendChild(row)
    })

    return fragment
  }
}

module.exports = TextFormat
