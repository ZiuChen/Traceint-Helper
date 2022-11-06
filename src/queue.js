const { WebSocket } = require('ws')
const { sleep } = require('./utils')

const options = {
  headers: {
    'Cache-Control': 'no-cache',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6307001e)',
    'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
  }
}

const queue = async (cookieStr) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://wechat.v2.traceint.com/ws?ns=prereserve/queue', {
      ...options,
      Cookie: cookieStr
    })

    ws.on('open', async () => {
      console.log('连接Websocket服务器成功')

      ws.on('message', async (data) => {
        const msg = data.toString()
        console.log(msg)

        if (msg.includes('u6392')) {
          // 排队成功 返回的第一个字符
          console.log('排队成功')
          ws.close()
          resolve(true)
        } else if (msg.includes('1000')) {
          // 排队失败 一般为cookie失效
          console.log('排队失败')
          ws.close()
          resolve(false)
        } else if (msg.includes('u4e0d')) {
          // 不在排队时间段
          console.log('等待排队')
          await sleep(100)
        } else if (msg.includes('u767b')) {
          // 已登记成功了
          console.log('已登记成功座位')
          ws.close()
          resolve(false)
        } else {
          // 在队列中 data字段代表前方人数
          console.log(`前方还有${JSON.parse(msg).data}人`)
        }
      })
      ws.on('close', () => {
        console.log('排队连接已关闭')
      })
      ws.on('error', (err) => {
        console.log('排队连接出错: ' + err)
      })

      while (true) {
        ws.send('{"ns":"prereserve/queue","msg":""}')
        await sleep(100)
      }
    })
  })
}

module.exports = queue
