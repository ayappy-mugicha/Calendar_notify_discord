/**
 * エントリポイントと時間主導トリガー。
 *
 * 個別送信:
 *   - runGmailNotify()
 *   - runCalendarNotify()
 * まとめて（Config.ENABLE_* で切替）:
 *   - runAll()
 * 毎日 6:00 JST（送信先を指定。既存の朝トリガーは置き換え）:
 *   - createDailyTriggerDiscord()
 *   - createDailyTriggerGoogleChat()
 *   - createDailyTriggerGmail()
 * 送信先を変えない既存の Discord トリガー:
 *   - createDailyTrigger()
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
 * 送信先は Discord 固定（Config.DESTINATION は見ない）。
 */
function createDailyTrigger() {
  replaceDailyTrigger_('runAllDiscord');
}

/**
 * 毎日 6:00 JST の朝トリガーを、指定した送信先の1本に置き換える。
 * @param {string} destination discord | googlechat | gmail
 */
function createDailyTriggerFor(destination) {
  var handler = dailyHandlerFor_(destination);
  replaceDailyTrigger_(handler);
}

/** 朝の通知を Discord へ送るトリガーを設定する。 */
function createDailyTriggerDiscord() {
  createDailyTriggerFor('discord');
}

/** 朝の通知を Google Chat へ送るトリガーを設定する。 */
function createDailyTriggerGoogleChat() {
  createDailyTriggerFor('googlechat');
}

/** 朝の通知を自分宛メールへ送るトリガーを設定する。 */
function createDailyTriggerGmail() {
  createDailyTriggerFor('gmail');
}

/** トリガーから呼ぶ。Discord へ送る。 */
function runAllDiscord() {
  return runAllTo_('discord');
}

/** トリガーから呼ぶ。Google Chat へ送る。 */
function runAllGoogleChat() {
  return runAllTo_('googlechat');
}

/** トリガーから呼ぶ。自分宛メールへ送る。 */
function runAllGmail() {
  return runAllTo_('gmail');
}

/**
 * @param {string} destination
 * @return {{gmail: Object|null, calendar: Object|null}}
 */
function runAllTo_(destination) {
  var previous = Config.DESTINATION;
  Config.DESTINATION = normalizeDestination_(destination);
  try {
    return runAll();
  } finally {
    Config.DESTINATION = previous;
  }
}

/**
 * @param {string} destination
 * @return {string}
 */
function dailyHandlerFor_(destination) {
  var normalized = normalizeDestination_(destination);
  if (normalized === 'discord') {
    return 'runAllDiscord';
  }
  if (normalized === 'googlechat') {
    return 'runAllGoogleChat';
  }
  return 'runAllGmail';
}

/**
 * @param {string} destination
 * @return {string}
 */
function normalizeDestination_(destination) {
  var value = String(destination || '').toLowerCase();
  if (value === 'discord' || value === 'googlechat' || value === 'gmail') {
    return value;
  }
  throw new Error(
    '送信先は discord / googlechat / gmail のいずれかを指定してください。'
  );
}

/**
 * 朝の通知トリガーを1本だけ残す。
 * @param {string} handler
 */
function replaceDailyTrigger_(handler) {
  var handlers = ['runAll', 'runAllDiscord', 'runAllGoogleChat', 'runAllGmail'];
  for (var i = 0; i < handlers.length; i++) {
    deleteTriggersByHandler_(handlers[i]);
  }
  ScriptApp.newTrigger(handler)
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .inTimezone(Config.TIMEZONE)
    .create();
  Logger.log('Daily trigger created: ' + handler + ' at 06:00 ' + Config.TIMEZONE);
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
