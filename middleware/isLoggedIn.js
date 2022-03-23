module.exports = (req, res, next) => {
  if (!req.session.username) {
    const attemptedUrl = req.originalUrl

    return res.redirect(`/auth/login?return=${attemptedUrl}`)
  }
  req.username = req.session.username
  next()
}
