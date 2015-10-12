
module.exports = function (name) {
  return pick(require('./options/' + name))
}

function pick (module) {
  return function (a, b, c) {
    if (arguments.length === 2) {
      module.request(a, b)
    }
    else {
      module.response(a, b, c)
    }
  }
}
