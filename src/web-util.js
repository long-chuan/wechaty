const http  = require('http')
const log = require('./npmlog-env')

const WebUtil = {
  stripHtml:      stripHtml
  , unescapeHtml: unescapeHtml
  , digestEmoji:  digestEmoji
  , plainText:  plainText

  , downloadStream: downloadStream
}

function stripHtml(html) {
  return String(html).replace(/(<([^>]+)>)/ig,'')
}

function unescapeHtml(str) {
  return String(str)
  .replace(/&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&')
}

function digestEmoji(html) {
  return String(html)
  .replace(/<img class="(\w*?emoji) (\w*?emoji[^"]+?)" text="(.*?)_web" src=[^>]+>/g
    , '$3') // <img class="emoji emoji1f4a4" text="[流汗]_web" src="/zh_CN/htmledition/v2/images/spacer.gif" />
  .replace(/<span class="(\w*?emoji) (\w*?emoji[^"]+?)"><\/span>/g
    , '[$2]') // '<span class="emoji emoji1f334"></span>'
}

function plainText(html) {
  return stripHtml(
    unescapeHtml(
      stripHtml(
        digestEmoji(
          html
        )
      )
    )
  )
}

function downloadStream(url, cookies) {
  // const myurl = 'http://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetmsgimg?&MsgID=3080011908135131569&skey=%40crypt_c117402d_53a58f8fbb21978167a3fc7d3be7f8c9'
  url = url.replace(/^https/i, 'http') // use http for better performance
  const options = require('url').parse(url)

  options.headers = {
    Accept: 'image/webp,image/*,*/*;q=0.8'
    , 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
    , Referer: 'https://wx.qq.com/'
    , 'Accept-Encoding': 'gzip, deflate, sdch'
    , 'Accept-Language': 'zh-CN,zh;q=0.8'
  }
  options.agent = http.globalAgent

  // 'pgv_pvi=6639183872; pgv_si=s8359147520; webwxuvid=747895d9dac5a25dd3a78175a5e931d879e026cacaf3ac06de0bd5f071470e7182fa36f7f1f0477ae5ee9266f741999a; mm_lang=zh_CN; MM_WX_NOTIFY_STATE=1; MM_WX_SOUND_STATE=1; wxloadtime=1465928826_expired; wxpluginkey=1465901102; wxuin=1211516682; wxsid=zMT7Gb24aTQzB1rA; webwx_data_ticket=gSeBbuhX+0kFdkXbgeQwr6Ck'
  options.headers.Cookie = cookies.map(c => `${c.name}=${c.value}`).join('; ')
  // log.verbose('WebUtil', 'Cookie: %s', options.headers.Cookie)

  return new Promise((resolve, reject) => {
    req = http.request(options, (res) => {
      // console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      // res.setEncoding('utf8');
      resolve(res)
    })

    req.on('error', (e) => {
      log.warn('WebUtil', `downloadStream() problem with request: ${e.message}`)
    })
    req.end()
  })
}
module.exports = WebUtil
