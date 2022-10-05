const env = require('./env')

const cookies = {
  wechatSESS_ID: env.wechatSESS_ID,
  Authorization: env.Authorization
}

// transfer to string
const cookieStr = Object.keys(cookies)
  .map((key) => `${key}=${cookies[key]}`)
  .join('; ')

module.exports = cookieStr
