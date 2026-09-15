/**
 * Discord Incoming Webhook 送信。
 */

/**
 * @param {string} content
 * @param {Object=} embed
 */
function sendDiscordMessage(content, embed) {
  var payload = {
    username: Config.DISCORD_USERNAME
  };
  if (content) {
    payload.content = content;
  }
  if (embed) {
    payload.embeds = [embed];
  }
  postDiscordPayload_(payload);
}

/**
 * @param {Object} payload
 */
function postDiscordPayload_(payload) {
  var url = getDiscordWebhookUrl();
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error(
      'Discord Webhook 失敗: HTTP ' + code + ' ' + response.getContentText()
    );
  }
}

/**
 * Discord Embed の field 上限(25)を超えないよう分割して送る。
 * @param {string} title
 * @param {string} description
 * @param {Array<{name: string, value: string, inline?: boolean}>} fields
 * @param {number=} color
 */
function sendDiscordEmbedChunks(title, description, fields, color) {
  var embedColor = color != null ? color : 0x5865f2;
  if (!fields || fields.length === 0) {
    sendDiscordMessage(null, {
      title: title,
      description: description || '（なし）',
      color: embedColor,
      timestamp: new Date().toISOString()
    });
    return;
  }
  var chunkSize = 25;
  for (var i = 0; i < fields.length; i += chunkSize) {
    var chunk = fields.slice(i, i + chunkSize);
    var part =
      fields.length > chunkSize
        ? ' (' + (Math.floor(i / chunkSize) + 1) + ')'
        : '';
    sendDiscordMessage(null, {
      title: title + part,
      description: i === 0 ? description || '' : '',
      color: embedColor,
      fields: chunk,
      timestamp: new Date().toISOString()
    });
  }
}
