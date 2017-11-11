let chai = require('chai'), should = chai.should()

let WebHookHandler = require('../WebHookHandler')

describe("WebHookHandler", function(){
  describe("when pull request created", function() {
    it('returns new pull request message', function(){
      let handler = new WebHookHandler("pull_request", require('./pull_request_created.json'))
      let parsed = handler.getParsedObj()
      parsed.sender.should.equal("baxterthehacker")
      parsed.message.should.include("* :new: Pull Request* public-repo <https://github.com/baxterthehacker/public-repo/pull/1|#1> by baxterthehacker")
    })
  })
  describe("when pull request merged", function() {
    it('returns merged pull request message', function(){
      let handler = new WebHookHandler("pull_request", require('./pull_request_merged.json'))
      let parsed = handler.getParsedObj()
      parsed.sender.should.equal("awesome_reviewer")
      parsed.message.should.include("* Merged Pull Request* public-repo <https://github.com/baxterthehacker/public-repo/pull/1|#1> by awesome_reviewer")
      parsed.message.should.include(":information_desk_person::skin-tone-2: @baxterthehacker")
    })
  })
  describe("when pull request review commented", function() {
    it('returns pull request commented message', function(){
      let handler = new WebHookHandler("pull_request_review_comment", require('./pull_request_review_comment.json'))
      let parsed = handler.getParsedObj()
      parsed.sender.should.equal("baxterthehacker")
      parsed.message.should.include("* :speech_balloon: to Pull Request* public-repo <https://github.com/baxterthehacker/public-repo/pull/1|#1> by baxterthehacker")
    })
  })
  describe("when issue commented", function() {
    it('returns issue commented message', function(){
      let handler = new WebHookHandler("issue_comment", require('./issue_comment.json'))
      let parsed = handler.getParsedObj()
      parsed.sender.should.equal("baxterthehacker")
      parsed.message.should.include("* :speech_balloon: to Pull Request* public-repo <https://github.com/baxterthehacker/public-repo/pull/1|#2> by baxterthehacker")
    })
  })
  describe("when pull request approved", function() {
    it('returns pull request approved message', function(){
      let handler = new WebHookHandler("pull_request_review", require('./pullrequest_approve.json'))
      let parsed = handler.getParsedObj()
      parsed.sender.should.equal("awesome_reviewer")
      parsed.message.should.include("*Approved Pull Request* public-repo <https://github.com/baxterthehacker/public-repo/pull/8|#8> by awesome_reviewer")
      parsed.message.should.include("Looks great!")
      parsed.message.should.include(":information_desk_person::skin-tone-2: @skalnik")
    })
  })
})
