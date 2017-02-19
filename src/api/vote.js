import io from 'socket.io-client'
import CommonUtil from './CommonUtil.js'

console.log('Socket JS loaded')

const VOTE = {
  voteCount: 0,
  votePeople: 0,
  onlineCount: 0,
  voteDetail: [{num: 0}, {num: 0}, {num: 0}, {num: 0}, {num: 0}],
  socket: null,
  con: null,
  hasVoteDetail: [],

  init: function (con) {
    this.con = con
    var home = true
    if (home) {
      this.socket = io.connect('ws://192.168.3.3')
    } else {
      this.socket = io.connect('ws://shitao.clschina.com')
    }
    if (!window.localStorage.UUID) {
      window.localStorage.UUID = guid()
    }

    this.socket.emit('login', {UUID: window.localStorage.UUID})

    this.socket.on('hasVote', function (obj) {
      con.$store.state.voteProList = obj.uniqueVote
    })

    this.socket.on('voteInfo', function (obj) {
      VOTE.votePeople = obj.votePeople
      // 动画效果
      countUp(0, obj.voteDetail, 1500, VOTE.voteDetail)
      VOTE.voteCount = 0
      for (var i = obj.voteDetail.length - 1; i >= 0; i--) {
        VOTE.voteCount += obj.voteDetail[i].num
      }
    })

    this.socket.on('voteChange', function (obj) {
      VOTE.votePeople = obj.votePeople
      VOTE.voteCount = 0
      for (var i = obj.voteDetail.length - 1; i >= 0; i--) {
        VOTE.voteCount += obj.voteDetail[i].num
        VOTE.voteDetail[i].num = obj.voteDetail[i].num
      }
    })

    this.socket.on('loginChange', function (obj) {
      VOTE.onlineCount = obj.onlineCount
    })

    this.socket.on('voteError', function (obj) {
      CommonUtil.showToast(obj.message)
    })
  },

  getVoteInfo: function () {
    this.socket.emit('getVoteInfo', null)
  },

  vote: function (proId) {
    this.socket.emit('vote', {proId: proId})
  }
}

// 生成uuid
function guid () {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16).substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4()
}

// 投票柱形图的动画效果
function countUp (startVal, endValList, duration, voteCount) {
  var startTime = 0
  var progress, value
  function startCount (timestamp) {
    if (!startTime) {
      startTime = timestamp
    }
    progress = timestamp - startTime
    for (var i = 0; i < endValList.length; i++) {
      value = startVal + (endValList[i].num - startVal) * (progress / duration)
      value = (value > endValList[i].num) ? endValList[i].num : value
      voteCount[i].num = value.toFixed(0)
    }
    // console.log(timestamp + ',' + voteCount[2].num)
    progress < duration && window.requestAnimationFrame(startCount)
  }
  window.requestAnimationFrame(startCount)
}

export default VOTE