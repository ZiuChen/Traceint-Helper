require('dotenv').config()

const env = {
  wechatSESS_ID: process.env.wechatSESS_ID,
  Authorization: process.env.Authorization,
  Timeout: process.env.Timeout
}

try {
  env.ReserveTask = JSON.parse(process.env.ReserveTask)
} catch (error) {
  env.ReserveTask = []
  console.log('解析环境变量出错: ' + error)
}

module.exports = env
