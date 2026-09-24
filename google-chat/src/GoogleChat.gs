/**
 * Google Chat Incoming Webhook 送信。本文は { "text": "..." }。
 */

/**
 * 見出し・説明・項目を 1 メッセージの文字数上限で分割して送る。
 * @param {string} title
 * @param {string} description
 * @param {string[]} blocks
 */
function sendGoogleChatReport(title, description, blocks) {
  var limit = Config.CHAT_TEXT_LIMIT;
  var items = blocks && blocks.length ? blocks : ['該当なし'];
  var part = 1;
  var current = formatChatHeader_(title, description, part);

  for (var i = 0; i < items.length; i++) {
    var addition = '\n\n' + items[i];
    if (current.length + addition.length <= limit) {
      current += addition;
      continue;
    }
    postGoogleChatText_(current);
    part++;
    var nextHeader = formatChatHeader_(title, '', part);
    if (nextHeader.length + addition.length <= limit) {
      current = nextHeader + addition;
      continue;
    }
    var room = limit - nextHeader.length - 2;
    current = nextHeader + '\n\n' + truncate_(items[i], Math.max(room, 1));
  }
  postGoogleChatText_(current);
}

/**
 * @param {string} title
 * @param {string} description
 * @param {number} part
 * @return {string}
 */
function formatChatHeader_(title, description, part) {
  var line = title + (part > 1 ? ' (' + part + ')' : '');
  if (description) {
    return line + '\n' + description;
  }
  return line;
}

/**
 * @param {string} text
 */
function postGoogleChatText_(text) {
  var url = getGoogleChatWebhookUrl();
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text }),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Google Chat Webhook 失敗: HTTP ' + code);
  }
}
