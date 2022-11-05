const User = require('./src/User')
const { sleepUntil } = require('./src/utils')
const env = require('./src/env')

const main_handler = async () => {
  const user = new User()
  await user.init()

  // today reverse
  await user.startReserve(true)

  // tomorrow pre-reserve (auto queue)
  const { hour, minute, second } = env.SleepUntil
  await sleepUntil({ hour, minute, second })
  const q = await user.startQueue()
  if (q) {
    await user.startPrereserve()
  }
}

// main_handler()

exports.main_handler = main_handler
