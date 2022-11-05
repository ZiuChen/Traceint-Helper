module.exports = {
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  sleepUntil: ({ hour, minute, second }) => {
    const now = new Date()
    const time = {
      hour,
      minute,
      second
    }
    console.log(`休眠至: ${time.hour}:${time.minute}:${time.second}`)
    return new Promise((resolve) =>
      setTimeout(() => {
        console.log('休眠结束')
        resolve()
      }, now.setHours(time.hour, time.minute, time.second) - Date.now())
    )
  }
}
