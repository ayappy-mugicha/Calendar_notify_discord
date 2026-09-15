/**
 * 昨日 20:00 〜 今日 6:00 (JST) に届いた重要メールを Discord へ通知。
 */

/**
 * エントリ: Gmail のみ送信
 */
function notifyImportantGmail() {
  var window = getImportantMailWindow();
  var threads = fetchImportantThreadsInWindow_(window.start, window.end);
  var fields = [];

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j];
      var received = msg.getDate();
      if (received.getTime() < window.start.getTime()) {
        continue;
      }
      if (received.getTime() >= window.end.getTime()) {
        continue;
      }
      var subject = msg.getSubject() || '(件名なし)';
      var from = msg.getFrom() || '(不明)';
      var when = Utilities.formatDate(
        received,
        Config.TIMEZONE,
        'yyyy-MM-dd HH:mm'
      );
      var link = 'https://mail.google.com/mail/u/0/#inbox/' + thread.getId();
      fields.push({
        name: truncate_(subject, 256),
        value:
          'From: ' +
          truncate_(from, 200) +
          '\n受信: ' +
          when +
          '\n[開く](' +
          link +
          ')',
        inline: false
      });
    }
  }

  var startLabel = Utilities.formatDate(
    window.start,
    Config.TIMEZONE,
    'MM/dd HH:mm'
  );
  var endLabel = Utilities.formatDate(
    window.end,
    Config.TIMEZONE,
    'MM/dd HH:mm'
  );
  var desc =
    startLabel +
    ' 〜 ' +
    endLabel +
    ' (JST) の重要メール: ' +
    fields.length +
    ' 件';

  if (fields.length === 0) {
    sendDiscordEmbedChunks(
      '重要メール（夜間）',
      desc + '\n該当なし',
      [],
      0xed4245
    );
    return { count: 0 };
  }

  sendDiscordEmbedChunks('重要メール（夜間）', desc, fields, 0xed4245);
  return { count: fields.length };
}

/**
 * Gmail 検索は日付粒度のため広めに取り、時刻はコード側で絞る。
 * @param {Date} start
 * @param {Date} end
 * @return {GmailThread[]}
 */
function fetchImportantThreadsInWindow_(start, end) {
  var afterDay = Utilities.formatDate(
    new Date(start.getTime() - 24 * 60 * 60 * 1000),
    Config.TIMEZONE,
    'yyyy/MM/dd'
  );
  var beforeDay = Utilities.formatDate(
    new Date(end.getTime() + 24 * 60 * 60 * 1000),
    Config.TIMEZONE,
    'yyyy/MM/dd'
  );
  var query =
    'is:important after:' + afterDay + ' before:' + beforeDay + ' -in:spam';
  return GmailApp.search(query, 0, 50);
}

/**
 * @param {string} text
 * @param {number} max
 * @return {string}
 */
function truncate_(text, max) {
  if (!text) {
    return '';
  }
  if (text.length <= max) {
    return text;
  }
  return text.substring(0, max - 1) + '…';
}
