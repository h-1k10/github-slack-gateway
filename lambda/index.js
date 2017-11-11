'use strict'

let config = require('./config.json')
let WebHookHandler = require('./WebHookHandler')
let SlackClient = require('./SlackClient')

let githubNameToSlack = function (text) {
  return config.github_to_slack === undefined ? text : Object.keys(config.github_to_slack).reduce(function(prev, key) {
    return prev.replace(key, config.github_to_slack[key])
  }, text)
}

exports.handler = (event, context, callback) => {
  let parsed = new WebHookHandler(event.github_event, event.body_json).getParsedObj()
  let callbackFunc = function () {
    callback(null, {"result": "ok"})
  }

  if(parsed == null) {
    callbackFunc()
  } else {
    new SlackClient(config.token).postMessage(githubNameToSlack(parsed.message), `${parsed.sender} via bot` , config.channel, callbackFunc)
  }
}
