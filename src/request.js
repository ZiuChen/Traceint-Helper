const fetch = require('node-fetch')
const cookies = require('./cookies')
const operation = require('./operation')

const url = 'https://wechat.v2.traceint.com/index.php/graphql/'
const header = {
  'Content-Type': 'application/json',
  'app-version': '2.0.9',
  'user-agent':
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6307062c)',
  Cookie: cookies
}

const request = async (operationName, variables) => {
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

module.exports = request
