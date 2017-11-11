'use strict'

let request = require('request')

module.exports = class SlackClient {
  constructor(token) {
    this.token = token
  }

  postMessage(message, bot_name, channel, callback) {
    request({
        url: `https://slack.com/api/chat.postMessage?token=${this.token}&username=${bot_name}&text=${encodeURIComponent(message)}&channel=${encodeURIComponent(channel)}&icon_emoji=:octocat:&link_names=1`,
        method: 'GET'
      }, callback);
  }
}
