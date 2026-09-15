/**
 * 共通設定。Webhook URL は Script Properties に置く（コードに書かない）。
 * プロパティキー: DISCORD_WEBHOOK_URL
 *
 * ENABLE_* で runAll の対象を切替。個別実行は Main.gs の各関数を使う。
 */
var Config = {
  TIMEZONE: 'Asia/Tokyo',
  /** runAll で Gmail 通知を送るか */
  ENABLE_GMAIL: true,
  /** runAll で Calendar 通知を送るか */
  ENABLE_CALENDAR: true,
  WEBHOOK_PROPERTY_KEY: 'DISCORD_WEBHOOK_URL',
  GMAIL_WINDOW_START_HOUR: 20,
  GMAIL_WINDOW_END_HOUR: 6,
  DISCORD_USERNAME: 'Calendar Notify'
};

/**
 * @return {string}
 */
function getDiscordWebhookUrl() {
  var url = PropertiesService.getScriptProperties().getProperty(
    Config.WEBHOOK_PROPERTY_KEY
  );
  if (!url) {
    throw new Error(
      'Script Properties に ' +
        Config.WEBHOOK_PROPERTY_KEY +
        ' を設定してください。'
    );
  }
  return url;
}

/**
 * スクリプトの「今日」を Asia/Tokyo の日付として返す。
 * @return {Date} 当日 0:00 JST 相当の Date
 */
function getTodayInTimezone() {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, Config.TIMEZONE, 'yyyy-MM-dd');
  return parseDateInTimezone_(dateStr, 0, 0, 0);
}

/**
 * @param {string} yyyyMmDd
 * @param {number} hour
 * @param {number} minute
 * @param {number} second
 * @return {Date}
 */
function parseDateInTimezone_(yyyyMmDd, hour, minute, second) {
  // Asia/Tokyo 固定オフセット (+09:00) で ISO を組み立てる
  var pad = function (n) {
    return n < 10 ? '0' + n : String(n);
  };
  var iso =
    yyyyMmDd +
    'T' +
    pad(hour) +
    ':' +
    pad(minute) +
    ':' +
    pad(second) +
    '+09:00';
  return new Date(iso);
}

/**
 * Gmail 通知ウィンドウ: 昨日 20:00 〜 今日 6:00 (JST)
 * @return {{start: Date, end: Date}}
 */
function getImportantMailWindow() {
  var today = getTodayInTimezone();
  var todayStr = Utilities.formatDate(today, Config.TIMEZONE, 'yyyy-MM-dd');
  var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  var yesterdayStr = Utilities.formatDate(
    yesterday,
    Config.TIMEZONE,
    'yyyy-MM-dd'
  );
  return {
    start: parseDateInTimezone_(
      yesterdayStr,
      Config.GMAIL_WINDOW_START_HOUR,
      0,
      0
    ),
    end: parseDateInTimezone_(todayStr, Config.GMAIL_WINDOW_END_HOUR, 0, 0)
  };
}
