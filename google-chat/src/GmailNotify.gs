/**
 * 昨日 20:00 〜 今日 6:00 (JST) に届いた重要メールを Google Chat へ通知。
 */

/**
 * エントリ: Gmail のみ送信
 * @return {{count: number}}
 */
function notifyImportantGmail() {
  var report = collectImportantGmail_();
  sendGoogleChatReport(report.title, report.description, report.blocks);
  return { count: report.count };
}

/**
 * @return {{title: string, description: string, blocks: string[], count: number}}
 */
function collectImportantGmail_() {
  var window = getImportantMailWindow();
  var threads = fetchImportantThreadsInWindow_(window.start, window.end);
  var blocks = [];

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
      blocks.push(formatMailBlock_(msg, thread, received));
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
  return {
    title: '重要メール（夜間）',
    description:
      startLabel +
      ' 〜 ' +
      endLabel +
      ' (JST) の重要メール: ' +
      blocks.length +
      ' 件',
    blocks: blocks,
    count: blocks.length
  };
}

/**
 * @param {GmailMessage} msg
 * @param {GmailThread} thread
 * @param {Date} received
 * @return {string}
 */
function formatMailBlock_(msg, thread, received) {
  var subject = msg.getSubject() || '(件名なし)';
  var from = msg.getFrom() || '(不明)';
  var when = Utilities.formatDate(
    received,
    Config.TIMEZONE,
    'yyyy-MM-dd HH:mm'
  );
  var link = 'https://mail.google.com/mail/u/0/#inbox/' + thread.getId();
  return (
    truncate_(subject, 200) +
    '\nFrom: ' +
    truncate_(from, 200) +
    '\n受信: ' +
    when +
    '\n' +
    link
  );
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
