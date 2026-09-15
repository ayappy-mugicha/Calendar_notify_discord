/**
 * エントリポイントと時間主導トリガー。
 *
 * 個別送信:
 *   - runGmailNotify()
 *   - runCalendarNotify()
 * まとめて（Config.ENABLE_* で切替）:
 *   - runAll()
 * 毎日 6:00 JST:
 *   - createDailyTrigger() を一度実行
 */

/**
 * Gmail 重要メールのみ Discord へ送信。
 */
function runGmailNotify() {
  var result = notifyImportantGmail();
  Logger.log('Gmail notify done. count=' + result.count);
  return result;
}

/**
 * 今日のカレンダーのみ Discord へ送信。
 */
function runCalendarNotify() {
  var result = notifyTodayCalendar();
  Logger.log('Calendar notify done. count=' + result.count);
  return result;
}

/**
 * Config のフラグに従い、有効な通知だけ送る。
 */
function runAll() {
  var summary = { gmail: null, calendar: null };
  if (Config.ENABLE_GMAIL) {
    summary.gmail = notifyImportantGmail();
  } else {
    Logger.log('ENABLE_GMAIL=false: skipped');
  }
  if (Config.ENABLE_CALENDAR) {
    summary.calendar = notifyTodayCalendar();
  } else {
    Logger.log('ENABLE_CALENDAR=false: skipped');
  }
  Logger.log(JSON.stringify(summary));
  return summary;
}

/**
 * 既存の同名トリガーを消して、毎日 6:00（スクリプト TZ=Asia/Tokyo）に runAll を設定。
 */
function createDailyTrigger() {
  deleteTriggersByHandler_('runAll');
  ScriptApp.newTrigger('runAll')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .inTimezone(Config.TIMEZONE)
    .create();
  Logger.log('Daily trigger created: runAll at 06:00 ' + Config.TIMEZONE);
}

/**
 * @param {string} handlerFunction
 */
function deleteTriggersByHandler_(handlerFunction) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === handlerFunction) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
