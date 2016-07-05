const test = require('tap').test
const Message = require('../src/message')
const Contact = require('../src/contact')
const Puppet = require('../src/puppet')

const log = require('../src/npmlog-env')

Contact.attach(new Puppet())

test('Message constructor parser test', t => {
  const rawData = JSON.parse('{"MsgId":"179242112323992762","FromUserName":"@0bb3e4dd746fdbd4a80546aef66f4085","ToUserName":"@16d20edf23a3bf3bc71bb4140e91619f3ff33b4e33f7fcd25e65c1b02c7861ab","MsgType":1,"Content":"test123","Status":3,"ImgStatus":1,"CreateTime":1461652670,"VoiceLength":0,"PlayLength":0,"FileName":"","FileSize":"","MediaId":"","Url":"","AppMsgType":0,"StatusNotifyCode":0,"StatusNotifyUserName":"","RecommendInfo":{"UserName":"","NickName":"","QQNum":0,"Province":"","City":"","Content":"","Signature":"","Alias":"","Scene":0,"VerifyFlag":0,"AttrStatus":0,"Sex":0,"Ticket":"","OpCode":0},"ForwardFlag":0,"AppInfo":{"AppID":"","Type":0},"HasProductId":0,"Ticket":"","ImgHeight":0,"ImgWidth":0,"SubMsgType":0,"NewMsgId":179242112323992770,"MMPeerUserName":"@0bb3e4dd746fdbd4a80546aef66f4085","MMDigest":"test123","MMIsSend":false,"MMIsChatRoom":false,"MMUnread":true,"LocalID":"179242112323992762","ClientMsgId":"179242112323992762","MMActualContent":"test123","MMActualSender":"@0bb3e4dd746fdbd4a80546aef66f4085","MMDigestTime":"14:37","MMDisplayTime":1461652670,"MMTime":"14:37"}')

  const EXPECTED = {
    id:       '179242112323992762'
    , from:   '@0bb3e4dd746fdbd4a80546aef66f4085'
  }
  const m = new Message(rawData)

  t.equal(m.id          , EXPECTED.id   , 'id right')
  t.equal(m.get('from') , EXPECTED.from , 'from right')

  const s = m.toString()
  t.equal(typeof s, 'string', 'toString()')

  t.end()
})

test('Message ready() promise testing', t => {
  // must different with other rawData, because Contact class with load() will cache the result. or use Contact.resetPool()
  const rawData = JSON.parse('{"MsgId":"3009511950433684462","FromUserName":"@0748ee480711bf20af91c298a0d7dcc77c30a680c1004157386b81cf13474823","ToUserName":"@b58f91e0c5c9e841e290d862ddb63c14","MsgType":1,"Content":"哈哈","Status":3,"ImgStatus":1,"CreateTime":1462887888,"VoiceLength":0,"PlayLength":0,"FileName":"","FileSize":"","MediaId":"","Url":"","AppMsgType":0,"StatusNotifyCode":0,"StatusNotifyUserName":"","RecommendInfo":{"UserName":"","NickName":"","QQNum":0,"Province":"","City":"","Content":"","Signature":"","Alias":"","Scene":0,"VerifyFlag":0,"AttrStatus":0,"Sex":0,"Ticket":"","OpCode":0},"ForwardFlag":0,"AppInfo":{"AppID":"","Type":0},"HasProductId":0,"Ticket":"","ImgHeight":0,"ImgWidth":0,"SubMsgType":0,"NewMsgId":3009511950433684500,"MMPeerUserName":"@0748ee480711bf20af91c298a0d7dcc77c30a680c1004157386b81cf13474823","MMDigest":"哈哈","MMIsSend":false,"MMIsChatRoom":false,"MMUnread":false,"LocalID":"3009511950433684462","ClientMsgId":"3009511950433684462","MMActualContent":"哈哈","MMActualSender":"@0748ee480711bf20af91c298a0d7dcc77c30a680c1004157386b81cf13474823","MMDigestTime":"21:44","MMDisplayTime":1462887888,"MMTime":"21:44","_h":104,"_index":0,"_offsetTop":0,"$$hashKey":"098"}')

  const expectedFromUserName  = '@0748ee480711bf20af91c298a0d7dcc77c30a680c1004157386b81cf13474823'
  const expectedToUserName    = '@b58f91e0c5c9e841e290d862ddb63c14'
  const expectedFromNickName  = 'From Nick Name Test'
  const expectedToNickName    = 'To Nick Name Test'
  const expectedMsgId        = '3009511950433684462'

  Contact.init()

  // Mock
  Contact.puppet.getContact = function (id) {
    log.silly('TestMessage', `mocked getContact(${id})`)
    return new Promise((resolve,reject) => {
      let obj = {}
      switch (id) {
        case expectedFromUserName:
          obj = {
            UserName: expectedFromUserName
            , NickName: expectedFromNickName
          }
          break
        case expectedToUserName:
          obj = {
            UserName: expectedToUserName
            , NickName: expectedToNickName
          }
          break
        default:
          log.error('TestMessage', `mocked getContact(${id}) unknown`)
          break
      }
      log.silly('TestMessage', 'setTimeout mocked getContact')
      setTimeout(r => {
        log.silly('TestMessage', 'mocked getContact resolved')
        return resolve(obj)
      }, 200)
    })
  }

  const m = new Message(rawData)

  t.equal(m.id, expectedMsgId, 'id/MsgId right')

  const p = m.ready()
  p.then(r => {
    const fc = Contact.load(m.get('from'))
    const tc = Contact.load(m.get('to'))
    t.equal(fc.get('id')   , expectedFromUserName, 'contact ready for FromUserName')
    t.equal(fc.get('name') , expectedFromNickName, 'contact ready for FromNickName')
    t.equal(tc.get('id')   , expectedToUserName  , 'contact ready for ToUserName')
    t.equal(tc.get('name') , expectedToNickName  , 'contact ready for ToNickName')
  })
  .catch(e => t.fail('m.ready() rejected: ' + e))
  .then(t.end) // test end
})

test('TBW: Message static method', t => {
  Contact.attach(new Puppet())

  const m = Message.find({
    id: 'xxx'
  }, {
    limit: 1
  })

  t.ok(m.get('id'), 'Message.find')

  const ms = Message.findAll({
    from: 'yyy'
  }, {
    limit: 2
  })

  t.equal(ms.length, 2, 'Message.findAll with limit 2')

  t.end()
})
