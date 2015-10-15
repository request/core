
exports.request = function (req, options) {
  if (options.end === false) return

  if (
    // not started
    !req._started &&
    // not piped
    !req._src
  ) {
    req.end()
  }
}
