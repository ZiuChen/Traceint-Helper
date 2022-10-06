const request = require('./request')
const env = require('./env')
const { sleep } = require('./utils')

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
      .map((lib) => lib.lib_name + ' libId: ' + lib.lib_id)
      .join('\n')}`
    console.log(msg)
  }

  async startReserve(isMapAll = false) {
    console.log('开始今日预约')
    const msg = `已设置预约任务: ${this.reserveTask.length}个${
      this.reserveTask.length > 0
        ? '\n' + this.reserveTask.map((task) => task.libId + ' ' + task.seatId).join('\n')
        : ''
    }`
    console.log(msg)
    if (this.reserveTask.length > 0 && !isMapAll) {
      // 配置了任务 按任务预定
      console.log('按预约任务检索')
      const loop = async () => {
        for (const task of this.reserveTask) {
          await this.fetchSeatList(task.libId) // 获取最新的座位信息
          await this.reserve(task.libId, task.seatId)
          await sleep(parseInt(env.Timeout))
        }
        loop()
      }
      loop()
    } else {
      // 未配置任务 捡漏模式 有座即可
      console.log('检索所有图书馆')
      const loop = async () => {
        for (const lib of this.libList) {
          if (env.IgnoreLibIds.includes(lib.lib_id)) {
            console.log(lib.lib_name + '已忽略')
            continue
          }
          await this.fetchSeatList(lib.lib_id)
          // 获取当前图书馆所有空位
          const seats = lib.seats.filter((seat) => seat.seat_status === 1)
          if (!seats.length) {
            console.log(lib.lib_name + '无空位')
            continue
          }
          console.log(lib.lib_name + ' 有空位: ' + seats.map((seat) => seat.name).join(','))
          for (const seat of seats) {
            await this.reserve(lib.lib_id, seat.name)
            await sleep(parseInt(env.Timeout))
          }
        }
        loop()
      }
      loop()
    }
  }

  async startPrereserve(isMapAll = false) {
    console.log('开始明日预约')
    if (this.reserveTask.length > 0 && !isMapAll) {
      // 配置了任务 按任务预定
      console.log('按预约任务检索')
      const loop = async () => {
        for (const task of this.reserveTask) {
          await this.prereserve(task.libId, task.seatId)
          await sleep(parseInt(env.Timeout))
        }
        loop()
      }
      loop()
    } else {
      // 捡漏模式 有座即可
      console.log('检索所有图书馆')
      const loop = async () => {
        for (const lib of this.libList) {
          if (env.IgnoreLibIds.includes(lib.lib_id)) {
            console.log(lib.lib_name + '已忽略')
            continue
          }
          await this.fetchPrereserveSeatList(lib.lib_id)
          // 获取当前图书馆所有空位
          const seats = lib.seats.filter((seat) => seat.seat_status === 1)
          if (!seats.length) {
            console.log(lib.lib_name + '无空位')
            continue
          }
          console.log(lib.lib_name + ' 有空位: ' + seats.map((seat) => seat.name).join(','))
          for (const seat of seats) {
            await this.prereserve(lib.lib_id, seat.name)
            await sleep(parseInt(env.Timeout))
          }
        }
        loop()
      }
      loop()
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
          this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name +
          seatId +
          ' ' +
          data.errors[0].msg
      )
      return
    } else {
      console.log(
        '预约成功: ' + this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name + seatId
      )
      return
    }
  }

  async fetchPrereserveLibList() {
    const data = await request('pre_index')
    return data.data.userAuth.prereserve.libs
  }

  async fetchPrereserveSeatList(libId) {
    const data = await request('pre_libLayout', {
      libId: libId
    })
    const seats = data.data.userAuth.prereserve.libLayout?.seats
    if (!seats) {
      console.log('获取场馆座位信息出错: ' + libId + ' ' + data.errors[0].msg)
      return
    } else {
      return seats
    }
  }

  async prereserve(libId, seatId) {
    const seats = await this.fetchPrereserveSeatList(libId)
    // seat.name: 045 / 046 but not 45 / 46
    const seatKey = seats.filter((seat) => parseInt(seat.name) == seatId)[0]?.key
    if (!seatKey) {
      console.log('未找到座位: ' + seatId)
      return
    }
    const data = await request('pre_reserveSeat', {
      key: seatKey,
      libid: libId,
      captchaCode: '',
      captcha: ''
    })
    if (!data?.data?.userAuth?.prereserve?.save) {
      console.log(
        '预约失败: ' +
          this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name +
          seatId +
          ' ' +
          data.errors[0].msg
      )
      return
    } else {
      console.log(
        '预约成功: ' + this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name + seatId
      )
      return
    }
  }
}

module.exports = User
