/**
 * Config.DESTINATION に応じて Discord / Google Chat / 自分宛メールへ送る。
 * discord | googlechat | gmail
 */

/**
 * @param {string} title
 * @param {string} description
 * @param {Array<{name: string, value: string}>} fields
 * @param {number=} color
 */
function deliverReport_(title, description, fields, color) {
  var destination = normalizeDestination_(Config.DESTINATION || 'discord');
  if (destination === 'discord') {
    sendDiscordEmbedChunks(title, description, fields, color);
    return;
  }
  var blocks = fieldsToPlainBlocks_(fields);
  if (destination === 'googlechat') {
    sendGoogleChatReport(title, description, blocks);
    return;
  }
  var day = Utilities.formatDate(
    getTodayInTimezone(),
    Config.TIMEZONE,
    'yyyy-MM-dd'
  );
  sendDigestEmail(
    title + ' ' + day,
    formatReportText(title, description, blocks)
  );
}

/**
 * Discord 用の Markdown リンクを、Chat とメール向けの URL に戻す。
 * @param {Array<{name: string, value: string}>} fields
 * @return {string[]}
 */
function fieldsToPlainBlocks_(fields) {
  var blocks = [];
  if (!fields) {
    return blocks;
  }
  for (var i = 0; i < fields.length; i++) {
    var value = String(fields[i].value || '').replace(
      /\[開く\]\(([^)]+)\)/g,
      '$1'
    );
    blocks.push(String(fields[i].name || '') + '\n' + value);
  }
  return blocks;
}

/**
 * @return {string}
 */
function getGoogleChatWebhookUrl() {
  var url = PropertiesService.getScriptProperties().getProperty(
    Config.CHAT_WEBHOOK_PROPERTY_KEY
  );
  if (!url) {
    throw new Error(
      'Script Properties に ' +
        Config.CHAT_WEBHOOK_PROPERTY_KEY +
        ' を設定してください。'
    );
  }
  if (url.indexOf('https://') !== 0) {
    throw new Error(
      Config.CHAT_WEBHOOK_PROPERTY_KEY +
        ' は https:// で始まる URL にしてください。'
    );
  }
  return url;
}

/**
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
  var response = UrlFetchApp.fetch(getGoogleChatWebhookUrl(), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text }),
    muteHttpExceptions: true
  });
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Google Chat Webhook 失敗: HTTP ' + code);
  }
}

/**
 * @return {string}
 */
function getNotifyEmail() {
  var override = PropertiesService.getScriptProperties().getProperty(
    Config.NOTIFY_EMAIL_PROPERTY_KEY
  );
  if (override) {
    if (!isSafeEmail_(override)) {
      throw new Error(
        'Script Properties の ' +
          Config.NOTIFY_EMAIL_PROPERTY_KEY +
          ' がメールアドレスとして不正です。'
      );
    }
    return override;
  }
  var email = Session.getEffectiveUser().getEmail();
  if (!email || !isSafeEmail_(email)) {
    throw new Error(
      '送信先を取得できません。Script Properties に ' +
        Config.NOTIFY_EMAIL_PROPERTY_KEY +
        ' を設定してください。'
    );
  }
  return email;
}

/**
 * @param {string} value
 * @return {boolean}
 */
function isSafeEmail_(value) {
  if (!value || value.indexOf('\n') !== -1 || value.indexOf('\r') !== -1) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * 件名・本文の全文はログに出さない。
 * @param {string} subject
 * @param {string} body
 */
function sendDigestEmail(subject, body) {
  MailApp.sendEmail(getNotifyEmail(), subject, body);
}

/**
 * @param {string} title
 * @param {string} description
 * @param {string[]} blocks
 * @return {string}
 */
function formatReportText(title, description, blocks) {
  var lines = [title, description];
  if (!blocks || blocks.length === 0) {
    lines.push('該当なし');
    return lines.join('\n');
  }
  lines.push('');
  lines.push(blocks.join('\n\n'));
  return lines.join('\n');
}
