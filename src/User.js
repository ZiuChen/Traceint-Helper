const request = require('./request')
const env = require('./env')

const User = class {
  userInfo
  userNick
  libList
  reserveTask

  constructor() {
    this.reserveTask = env.ReserveTask
  }

  get header() {
    return {
      Accept: '*/*',
      'User-Agent': 'MicroMessenger/8.0.2',
      Cookie: 'wechatSESS_ID=' + this.sessid + ';' + 'Authorization=' + this.Authorization
    }
  }

  async init() {
    await this.fetchUserInfo()
    await this.fetchLibList()
    const msg = `用户名: ${this.userNick}\n共有${this.libList.length}个场馆:\n${this.libList
      .map((lib) => lib.lib_name + ': ' + lib.lib_id)
      .join('\n')}`
    console.log(msg)
  }

  async start() {
    const msg = `已设置预约任务: ${this.reserveTask.length}个\n${
      this.reserveTask.length > 0
        ? this.reserveTask.map((task) => task.libId + ' ' + task.seatId).join('\n')
        : ''
    }`
    console.log(msg)
    if (this.reserveTask.length > 0) {
      // 配置了任务 按任务预定
      setInterval(async () => {
        for (const task of this.reserveTask) {
          await this.fetchSeatList(task.libId) // 获取最新的座位信息
          await this.reserve(task.libId, task.seatId)
        }
      }, 2e3)
    } else {
      // 未配置任务 捡漏模式 有座即可
      setInterval(async () => {
        for (const lib of this.libList) {
          await this.fetchSeatList(lib.lib_id)
          // 获取当前图书馆所有空位
          const seats = lib.seats.filter((seat) => seat.seat_status === 1)
          if (seats.length > 0) {
            console.log('有空位: ' + lib.lib_name + seats.map((seat) => seat.name).join(','))
            for (const seat of seats) {
              await this.reserve(lib.lib_id, seat.name)
            }
          } else {
            console.log(lib.lib_name + '无空位')
          }
        }
      }, 2e3)
    }
  }

  async fetchUserInfo() {
    const data = await request('userInfo', {
      pos: 'App-首页'
    })
    if (!data.data.userAuth) {
      console.log('cookie已过期')
      return
    }
    this.userInfo = data
    this.userNick = data.data.userAuth.currentUser.user_nick
    return this.userInfo
  }

  async nickName() {
    if (!this.userNick) {
      const data = await this.fetchUserInfo()
      this.userNick = data.data.user.user_nick
    }
    return this.userNick
  }

  async fetchLibList() {
    const data = await request('index')
    this.libList = data.data.userAuth.prereserve.libs
    console.log(this.libList)
    return this.libList
  }

  async fetchSeatList(libId) {
    const data = await request('libLayout', {
      libId: libId
    })
    // status: 1 可选 2 已选 3 有人 4 暂离
    const seatsArray = data.data.userAuth.reserve.libs[0].lib_layout.seats

    this.libList.filter((lib) => lib.lib_id === libId)[0].seats = seatsArray
    return seatsArray
  }

  async reserve(libId, seatId) {
    const seats = this.libList.filter((lib) => lib.lib_id === libId)[0].seats
    const seatKey = seats.filter((seat) => seat.name === seatId.toString())[0].key
    if (!seatKey) {
      console.log('未找到座位: ' + seatId)
      return
    }
    const data = await request('reserveSeat', {
      seatKey: seatKey,
      libId: libId,
      captchaCode: '',
      captcha: ''
    })
    if (!data.data.userAuth.reserve.reserveSeat) {
      console.log(
        '预约失败: ' +
          this.libList.filter((lib) => lib.lib_id === libId)[0].lib_name +
          seatId +
          ' ' +
          data.errors[0].msg
      )
      return
    } else {
      console.log(
        '预约成功: ' + this.libList.filter((lib) => lib.lib_id === libId)[0].lib_name + seatId
      )
      return
    }
  }
}

module.exports = User
