const env = require('./env')

const cookieStr = env.Cookie ? env.Cookie : 'Authorization=' + env.Authorization || ''

module.exports = cookieStr
