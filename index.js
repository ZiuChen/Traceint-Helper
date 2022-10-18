const User = require('./src/User')

const main = async () => {
  const user = new User()
  await user.init()
  // 今日预约
  await user.startReserve(true)
  // 明日预约: 自动排队
  // const q = await user.startQueue()
  // if (q) {
  //   await user.startPrereserve()
  // }
  // 明日预约: 手动排队
  // await user.startPrereserve()
}

main()
