var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require("crypto");
var async = require('async');
var fs = require('fs');

global.nakayama_kazuya_line_id = 'U46c1cff311cfb69c050a7ae2f1abd18d';

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

      console.log("リクエスト");
      // リクエストがLINE Platformから送られてきたか確認する
      if (!validate_signature(req.headers['x-line-signature'], req.body)) {
        return;
      }
      // beaconかテキストが送られてきた場合のみ返事をする
      if (!(req.body['events'][0]['type'] == 'message' || req.body['events'][0]['type'] == 'beacon')) {
        return;
      }

      // beaconが検知したときの処理
      //if (req.body['events'][0]['message']['text'].indexOf('beacon') != -1) {
      if (req.body['events'][0]['type'] == 'beacon') {
        console.log('===== enter beacon!! =====');
        request.post(create_push_message(global.nakayama_kazuya_line_id, "中山 一哉"), function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
          } else {
            console.log('error: ' + JSON.stringify(response));
          }
        });
        //console.log(req.body['events'][0]['source']['userId']);
      }

      // beaconが検知したときの処理
      else if (req.body['events'][0]['message']['text'].indexOf('beacon') != -1) {
      //else if (req.body['events'][0]['type'] == 'beacon') {
        console.log('===== enter beacon!! =====');
        request.post(create_push_message(global.nakayama_kazuya_line_id, "中山 一哉"), function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
          } else {
            console.log('error: ' + JSON.stringify(response));
          }
        });
        //console.log(req.body['events'][0]['source']['userId']);
      }
      // beaconが検知したときの処理
      else if (req.body['events'][0]['message']['text'].indexOf('大丈夫！') != -1) {
        //if (req.body['events'][0]['type'] == 'beacon') {
        console.log('===== enter daijobu!! =====');
        request.post(create_push_kusuri_message(global.nakayama_kazuya_line_id), function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
          } else {
            console.log('error: ' + JSON.stringify(response));
          }
        });
        //console.log(req.body['events'][0]['source']['userId']);
      }
      else if (req.body['events'][0]['message']['text'].indexOf('違和感あり') != -1) {
        //if (req.body['events'][0]['type'] == 'beacon') {
        console.log('===== enter iwakan!! =====');
        request.post(create_push_thx_message(global.nakayama_kazuya_line_id), function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
          } else {
            console.log('error: ' + JSON.stringify(response));
          }
        });
        //console.log(req.body['events'][0]['source']['userId']);
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
function create_push_kusuri_message(user_id) {
  //ヘッダーを定義
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}',
  };

  // 送信データ作成
  var data = {
    'to': user_id,
    "messages": [{
        'type': "text",
        'text': "ご報告ありがとうございます！"
      },
      {
        'type': "template",
        "altText": "this is a buttons template",
        "template": {
          "type": "buttons",
          "text": "ちなみに、お薬を今日ちゃんと飲まれてるかって分かりますか？",
          "actions": [{
              "type": "message",
              "label": "飲んでたよ！",
              "text": "飲んでたよ！"
            },
            {
              "type": "message",
              "label": "飲んでないみたい。。。",
              "text": "飲んでないみたい。。。"
            },
            {
              "type": "message",
              "label": "分かりません。",
              "text": "分かりません。"
            }
          ]
        }
      }
    ]
  };

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

// LINEの友達にtextをpush
function create_push_message(user_id, user_name) {
  //ヘッダーを定義
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}',
  };

  // 送信データ作成
  var data = {
    'to': user_id,
    "messages": [{
        'type': "text",
        'text': user_name + "さんのご自宅に何か違和感はありませんか？"
      },
      {
        'type': "text",
        'text': "洗濯物がほしっぱなしだったり、郵便受けがいっぱいだり、植木の手入れがされていなかったりしませんか？"
      },
      {
        'type': "template",
        "altText": "this is a buttons template",
        "template": {
          "type": "buttons",
          "text": "違和感はありませんか？",
          "actions": [{
              "type": "message",
              "label": "大丈夫！",
              "text": "大丈夫！"
            },
            {
              "type": "message",
              "label": "違和感あり",
              "text": "違和感あり"
            }
          ]
        }
      }
    ]
  };

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

// LINEの友達にtextをpush
function create_push_thx_message(user_id) {
  //ヘッダーを定義
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}',
  };

  // 送信データ作成
  var data = {
    'to': user_id,
    "messages": [{
        'type': "text",
        'text': "ご報告ありがとうございます。巡回いたします。"
      }
    ]
  };

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
