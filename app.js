var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require("crypto");
var async = require('async');
var fs = require('fs');

global.nakayama_kazuya_line_id = 'U2aca57e8b1a096a56b1199ae5311f7e5';

app.set('port', (process.env.PORT || 8000));
// JSONの送信を許可
app.use(bodyParser.urlencoded({
  extended: true
}));
// JSONのパースを楽に（受信時）
app.use(bodyParser.json());

app.post('/callback', function(req, res) {
  async.waterfall([
    function(callback) {
      // リクエストがLINE Platformから送られてきたか確認する
      if (!validate_signature(req.headers['x-line-signature'], req.body)) {
        return;
      }
      // テキストが送られてきた場合のみ返事をする
      if ((req.body['events'][0]['type'] != 'message') || (req.body['events'][0]['message']['type'] != 'text')) {
        return;
      }

      // beaconが検知したときの仮想処理
      if (req.body['events'][0]['type'] == 'message' && req.body['events'][0]['message']['text'].indexOf('ビーコン_オン') != -1) {
        console.log('===== ビーコン_オン と入力されました =====');
        request.post(create_push_message(global.nakayama_kazuya_line_id, "近くに困っている人がいます。"), function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
          } else {
            console.log('error: ' + JSON.stringify(response));
          }
        });
      }
    },
  ]);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running');
});

// 署名検証
function validate_signature(signature, body) {
  return signature == crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}

// LINEの友達にtextをpush
function create_push_message(user_id, text) {
  //ヘッダーを定義
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}',
  };

  // 送信データ作成
  var data;
  if (text != null) {
    data = {
      'to': user_id,
      "messages": [{
        'type': "template",
        "altText": "this is a buttons template",
        "template": {
          "type": "confirm",
          "text": text,
          "actions": [{
              "type": "message",
              "label": "任せて！",
              "text": "任せて！"
            },
            {
              "type": "message",
              "label": "今無理。。。",
              "text": "今無理。。。"
            }
          ]
        }
      }]
    };
  }

  //オプションを定義
  var options = {
    url: 'https://api.line.me/v2/bot/message/push',
    headers: headers,
    json: true,
    body: data
  };

  console.log('===== options =====\n' + options);
  return options;
}
