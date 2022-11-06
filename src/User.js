const path = require('path')
const notifier = require('node-notifier')
const fetch = require('node-fetch')

const operation = require('./operation')
const env = require('./env')
const { sleep } = require('./utils')
const queue = require('./queue')

// rewite console.log and add time prefix
const log = console.log
console.log = (...args) => {
  const date = new Date()
  const time = `${date.toLocaleString()}:${date.getMilliseconds()}`
  log(`[${time}]`, ...args)
}

const User = class {
  cookieStr
  userInfo
  userNick
  libList
  reserveTask

  constructor(cookie) {
    this.cookieStr = cookie
    this.reserveTask = env.ReserveTask
  }

  async init() {
    await this.fetchUserInfo()
    await this.fetchLibList()
    await this.fetchSeatList()
    await this.fetchPrereserveSeatList()
    const msg = `用户名: ${this.userNick}\n共有${this.libList.length}个场馆:\n${this.libList
      .map((lib) => lib.lib_name + ' libId: ' + lib.lib_id)
      .join('\n')}`
    console.log(msg)
    try {
      await this.checkIn()
    } catch (error) {
      console.log('签到失败: ' + error)
    }
  }

  async request(operationName, variables) {
    const url = 'https://wechat.v2.traceint.com/index.php/graphql/'
    const header = {
      'Content-Type': 'application/json',
      'app-version': '2.0.9',
      'user-agent':
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6307062c)',
      Cookie: this.cookieStr
    }
    return fetch(url, {
      method: 'POST',
      headers: header,
      body: JSON.stringify({
        operationName,
        query: operation[operationName],
        variables: {
          ...variables
        }
      })
    }).then((res) => res.json())
  }

  async startQueue() {
    return queue(this.cookieStr)
  }

  async startReserve(isMapAll = false) {
    console.log('开始今日预约')
    const msg = `已设置预约任务: ${this.reserveTask.length}个`
    console.log(msg)
    if (this.reserveTask.length > 0 && !isMapAll) {
      // 配置了任务 按任务预定
      console.log('按预约任务检索')
      let count = 0
      const loop = async () => {
        await this.fetchSeatList()
        for (const task of this.reserveTask) {
          const seat = this.libList
            .filter((lib) => lib.lib_id == task.libId)[0]
            .seats.filter((seat) => seat.name == task.seatId)[0]
          if (seat.seat_status === 1) {
            notifier.notify({
              icon: path.join(__dirname, 'icon.jpg'),
              title: 'Traceint-Helper',
              message: `图书馆${task.libId} ${task.seatId}有空位`
            })
            await this.reserve(task.libId, task.seatId)
            await sleep(parseInt(env.Timeout))
          }
        }
        console.log(`检索第${++count}次`)
        await sleep(parseInt(env.Timeout))
        await loop()
      }
      await loop()
    } else {
      // 未配置任务 捡漏模式 有座即可
      console.log('检索所有图书馆')
      const loop = async () => {
        await this.fetchSeatList()
        for (const lib of this.libList) {
          if (env.IgnoreLibIds.includes(lib.lib_id)) {
            console.log(lib.lib_name + '已忽略')
            continue
          }
          // 获取当前图书馆所有空位
          const seats = lib.seats.filter((seat) => seat.seat_status === 1)
          if (!seats.length) {
            console.log(lib.lib_name + '无空位')
            continue
          }
          const msg = lib.lib_name + ' 有空位: ' + seats.map((seat) => seat.name).join(',')
          notifier.notify({
            icon: path.join(__dirname, 'icon.jpg'),
            title: 'Traceint-Helper',
            message: msg
          })
          for (const seat of seats) {
            await this.reserve(lib.lib_id, seat.name)
            await sleep(parseInt(env.Timeout))
          }
        }
        await sleep(parseInt(env.Timeout))
        await loop()
      }
      await loop()
    }
    return
  }

  async startPrereserve(isMapAll = false) {
    console.log('开始明日预约')
    if (this.reserveTask.length > 0 && !isMapAll) {
      // 配置了任务 按任务预定
      console.log('按预约任务检索')
      const loop = async () => {
        await this.fetchPrereserveSeatList()
        for (const task of this.reserveTask) {
          const seats = this.libList.filter((lib) => lib.lib_id === task.libId)[0].pre_seats
          const seat = seats.filter((seat) => parseInt(seat.name) == task.seatId)[0]
          if (seat.status === false) {
            // false: 无人
            // seat_status都为 null 不知原因
            await this.prereserve(task.libId, task.seatId)
            await sleep(parseInt(env.Timeout))
          }
        }
        console.log('无空位')
        await sleep(parseInt(env.Timeout))
        await loop()
      }
      await loop()
    } else {
      // 捡漏模式 有座即可
      console.log('检索所有图书馆')
      const loop = async () => {
        await this.fetchPrereserveSeatList()
        for (const lib of this.libList) {
          if (env.IgnoreLibIds.includes(lib.lib_id)) {
            console.log(lib.lib_name + '已忽略')
            continue
          }
          // 获取当前图书馆所有空位
          const seats = lib.pre_seats.filter((seat) => seat.status === false && !!seat.name)
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
        await sleep(parseInt(env.Timeout))
        await loop()
      }
      await loop()
    }
    return
  }

  async checkIn() {
    const data = await this.request('getList')
    const taskId = data.data.userAuth.credit.tasks[0].id
    await this.request('checkIn', {
      user_task_id: taskId
    }).then(async (res) => {
      const done = res.data.userAuth.credit.done
      console.log(done ? '签到成功' : '签到失败: 今日已签到')
      if (done) {
        const queryRes = await this.request('user_credit')
        console.log('当前积分: ' + queryRes.data.userAuth.currentUser.user_credit)
      }
    })
  }

  async fetchUserInfo() {
    const data = await this.request('userInfo', {
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
    const data = await this.request('index')
    this.libList = data.data.userAuth.prereserve.libs
    return this.libList
  }

  async fetchSeatList() {
    // 更新今日预约所有场馆的座位信息
    for (const lib of this.libList) {
      const data = await this.request('libLayout', {
        libId: lib.lib_id
      })
      // status: 1 可选 2 已选 3 有人 4 暂离
      const seatsArray = data.data.userAuth.reserve.libs[0].lib_layout.seats
      this.libList.filter((l) => l.lib_id === lib.lib_id)[0].seats = seatsArray
    }
  }

  async reserve(libId, seatId) {
    const seats = this.libList.filter((lib) => lib.lib_id === libId)[0].seats
    const seatKey = seats.filter((seat) => parseInt(seat.name) == seatId)[0].key
    if (!seatKey) {
      console.log('未找到座位: ' + seatId)
      return
    }
    const data = await this.request('reserueSeat', {
      seatKey: seatKey,
      libId: libId,
      captchaCode: '',
      captcha: ''
    })
    if (!data.data.userAuth.reserve.reserueSeat) {
      console.log(
        '预约失败: ' +
          this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name +
          seatId +
          ' ' +
          data.errors[0].msg
      )
      return false
    } else {
      const msg =
        '预约成功: ' + this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name + seatId
      console.log(msg)
      notifier.notify({
        icon: path.join(__dirname, 'icon.jpg'),
        title: 'Traceint-Helper',
        message: msg
      })
      return true
    }
  }

  async fetchPrereserveSeatList() {
    // 更新明日预约所有场馆的座位信息
    for (const lib of this.libList) {
      const data = await this.request('pre_libLayout', {
        libId: lib.lib_id
      })
      const seatsArray = data.data.userAuth.prereserve.libLayout?.seats
      if (!seatsArray) {
        console.log('获取场馆座位信息出错: ' + lib.lib_id + ' ' + data.errors[0].msg)
        return
      } else {
        this.libList.filter((l) => l.lib_id === lib.lib_id)[0].pre_seats = seatsArray
      }
    }
  }

  async prereserve(libId, seatId) {
    // seat.name: 045 / 046 but not 45 / 46
    const seatKey = this.libList
      .filter((lib) => lib.lib_id === libId)[0]
      .pre_seats.filter((seat) => parseInt(seat.name) == seatId)[0].key
    if (!seatKey) {
      console.log('未找到座位: ' + seatId)
      return
    }
    const data = await this.request('save', {
      key: seatKey + '.',
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
      return false
    } else {
      const msg =
        '预约成功: ' + this.libList.filter((lib) => lib.lib_id == libId)[0].lib_name + seatId
      console.log(msg)
      notifier.notify({
        icon: path.join(__dirname, 'icon.jpg'),
        title: 'Traceint-Helper',
        message: msg
      })
      return true
    }
  }
}

module.exports = User
