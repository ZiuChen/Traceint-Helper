const User = require('./src/User')

const main = async () => {
  const user = new User()
  await user.init()
  // 今日预约
  await user.startReserve(true)
  // 明日预约
  // await user.startPrereserve(false)
}

main()
