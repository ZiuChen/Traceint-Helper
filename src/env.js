require('dotenv').config()

const env = {
  wechatSESS_ID: process.env.wechatSESS_ID,
  Authorization: process.env.Authorization,
  ReserveTask: [],
  Timeout: process.env.Timeout,
  IgnoreLibIds: []
}

try {
  env.ReserveTask = JSON.parse(process.env.ReserveTask)
  env.IgnoreLibIds = JSON.parse(process.env.IgnoreLibIds)
} catch (error) {
  console.log('解析环境变量出错: ' + error)
}

module.exports = env
