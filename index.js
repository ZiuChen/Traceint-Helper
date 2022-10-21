const User = require('./src/User')

const main = async () => {
  const user = new User()
  await user.init()
  // today reverse
  await user.startReserve(true)
  // tomorrow pre-reserve (manual queue)
  // await user.startPrereserve()
  // tomorrow pre-reserve (auto queue)
  // const q = await user.startQueue()
  // if (q) {
  //   await user.startPrereserve()
  // }
}

main()
