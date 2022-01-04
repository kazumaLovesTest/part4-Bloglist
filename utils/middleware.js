const jwt = require('jsonwebtoken')
const User = require('../model/user')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer '))
    request.token = authorization.substring(7)
  else
    request.token = null
  next()
}

const userExtractor = (async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id)
    response.status(401).json({
      error: 'invalid token'
    })
  const user = await User.findOne(decodedToken.username)
  request.user = user.toJSON()
  next()
})
module.exports = { tokenExtractor, userExtractor }