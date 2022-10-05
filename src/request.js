const fetch = require('node-fetch')
const cookies = require('./cookies')
const operation = require('./operation')

const url = 'https://wechat.v2.traceint.com/index.php/graphql/'
const header = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
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
