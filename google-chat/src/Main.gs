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
 * Gmail 重要メールのみ Google Chat へ送信。
 * @return {{count: number}}
 */
function runGmailNotify() {
  var result = notifyImportantGmail();
  Logger.log('Gmail notify done. count=' + result.count);
  return result;
}

/**
 * 今日のカレンダーのみ Google Chat へ送信。
 * @return {{count: number}}
 */
function runCalendarNotify() {
  var result = notifyTodayCalendar();
  Logger.log('Calendar notify done. count=' + result.count);
  return result;
}

/**
 * Config のフラグに従い、有効な通知だけ送る。
 * @return {{gmail: {count: number}|null, calendar: {count: number}|null}}
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
  Logger.log(
    'runAll done. gmail=' +
      countLabel_(summary.gmail) +
      ' calendar=' +
      countLabel_(summary.calendar)
  );
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
 * @param {{count: number}|null} result
 * @return {string}
 */
function countLabel_(result) {
  if (!result) {
    return 'skip';
  }
  return String(result.count);
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
