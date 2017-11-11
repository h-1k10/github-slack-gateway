'use strict'

module.exports = class WebHookHandler {
  constructor(github_event, json) {
      this.event = github_event
      this.json = json
      this.template = new SlackMessageTemplate()
  }

  getParsedObj() {
    switch(this.event) {
      case "pull_request":
        return this.getPullRequestMessage()
      case "pull_request_review":
        return this.getPullRequestReviewMessage()
      case "pull_request_review_comment":
        return this.getPullRequestReviewCommentMessage()
      case "issue_comment":
        return this.getIssueCommentMessage()
      default:
        return null
    }
  }

  getPullRequestMessage() {
    let pullRequest = this.json.pull_request
    let params = {"repository": this.json.repository.name,"sender": this.json.sender.login,"title":pullRequest.title,"description":pullRequest.body, "url": pullRequest.html_url, "number": pullRequest.number, "user": pullRequest.user.login, "merged": pullRequest.merged}

    var message = null

    switch(this.json.action) {
      case "opened":
        message = this.template.newPullRequest(params)
        break
      case "closed":
        message = this.template.closedPullRequest(params)
        break
      default:
        return null
    }

    return {"sender":params.sender, "message": message}
  }

  getPullRequestReviewCommentMessage() {
    let pullRequest = this.json.pull_request
    let params = {"repository": this.json.repository.name,"sender": this.json.sender.login,"title":pullRequest.title, "description":this.json.comment.body, "url": pullRequest.html_url, "number": pullRequest.number, "user": pullRequest.user.login, "merged": pullRequest.merged, "is_pull_request": true}

    switch(this.json.action) {
      case "created":
       let message = this.template.commented(params)
       return {"sender": params.sender, "message": message}
     default:
       return null
    }
  }

  getPullRequestReviewMessage() {
    let pullRequest = this.json.pull_request
    var params = {"repository": this.json.repository.name,"sender": this.json.sender.login,"title":pullRequest.title, "url": pullRequest.html_url, "number": pullRequest.number, "user": pullRequest.user.login, "is_pull_request": true, "state": this.json.review.state}

    switch(this.json.action) {
      case "submitted":
        let isCommented = this.json.review.state == "commented"

        if(isCommented && this.json.review.body == null) { // このとき、コメントはpull_request_review_commentでハンドリングしている
          return null
        }

        if(this.json.review.body) {
          params.description = this.json.review.body
        }

        let message = isCommented ? this.template.commented(params) : this.template.reviewed(params)

        return {"sender": params.sender, "message": message}
      default:
        return null
    }
  }

  getIssueCommentMessage() {
    switch(this.json.action) {
      case "created":
        let issue = this.json.issue
        let params = {"repository": this.json.repository.name,"sender": this.json.sender.login, "title":issue.title, "url": issue.html_url, "number": issue.number, "user": issue.user.login, "description":this.json.comment.body, "is_pull_request": issue.html_url.includes("/pull/")}
        let message = this.template.commented(params)
       return {"sender": params.sender, "message": message}
      default:
        return null
    }
  }
}

String.prototype.capitalize = function(){
    return this.charAt(0).toUpperCase() + this.slice(1);
}

class SlackMessageTemplate {
  constructor() {
    this.info_emoji = ":information_desk_person::skin-tone-2:"
  }

  newPullRequest(params) {
    return `
* :new: Pull Request* ${params.repository} <${params.url}|#${params.number}> by ${params.sender}
*${params.title}*
\`\`\`
${params.description}
\`\`\`
`
  }

  closedPullRequest(params) {
    let message = `
* ${params.merged ? "Merged" : "Closed"} Pull Request* ${params.repository} <${params.url}|#${params.number}> by ${params.sender}
*${params.title}*
`
    return this.appendMentionIfNecessary(message, params.sender, params.user)
  }

  commented(params) {
    return `
* :speech_balloon: to ${params.is_pull_request ? "Pull Request" : "Issue"}* ${params.repository} <${params.url}|#${params.number}> by ${params.sender}
*${params.title}*
\`\`\`
${params.description}
\`\`\`
`
  }

  reviewed(params) {
    var message = `
*${params.state.capitalize()} Pull Request* ${params.repository} <${params.url}|#${params.number}> by ${params.sender}
*${params.title}*
`
    if(params.description) {
      message += `
\`\`\`
${params.description}
\`\`\`
`
    }

    return this.appendMentionIfNecessary(message, params.sender, params.user)
  }

  appendMentionIfNecessary(message, sender, user) {
    return sender == user ? message : message + `\n${this.info_emoji} @${user}`
  }
}
