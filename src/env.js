require('dotenv').config()

const env = {
  Cookie: process.env.Cookie || '',
  Authorization: process.env.Authorization || '',
  ReserveTask: [],
  Timeout: process.env.Timeout,
  IgnoreLibIds: [],
  SleepUntil: {}
}

try {
  env.ReserveTask = JSON.parse(process.env.ReserveTask) || []
  env.IgnoreLibIds = JSON.parse(process.env.IgnoreLibIds) || []
  env.SleepUntil = JSON.parse(process.env.SleepUntil) || {}
} catch (error) {
  console.log('解析环境变量出错: ' + error)
}

module.exports = env
