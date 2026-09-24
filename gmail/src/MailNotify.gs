/**
 * 収集結果をスクリプト所有者（または NOTIFY_EMAIL）へ平文メールで送る。
 * 件名・本文の全文はログに出さない。
 */

/**
 * @param {string} subject
 * @param {string} body
 */
function sendDigestEmail(subject, body) {
  var to = getNotifyEmail();
  MailApp.sendEmail(to, subject, body);
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
