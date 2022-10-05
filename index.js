const User = require('./src/User')

const main = async () => {
  const user = new User()
  await user.init()
  await user.start()
}

main()
