/**
 * 共通設定。宛先の上書きは Script Properties の NOTIFY_EMAIL（任意）。
 * 未設定ならスクリプト所有者（時間トリガーでも取得できる実行ユーザー）へ送る。
 *
 * ENABLE_* で runAll の対象を切替。個別実行は Main.gs の各関数を使う。
 */
var Config = {
  TIMEZONE: 'Asia/Tokyo',
  /** runAll で重要メールの節を含めるか */
  ENABLE_GMAIL: true,
  /** runAll で今日の予定の節を含めるか */
  ENABLE_CALENDAR: true,
  NOTIFY_EMAIL_PROPERTY_KEY: 'NOTIFY_EMAIL',
  GMAIL_WINDOW_START_HOUR: 20,
  GMAIL_WINDOW_END_HOUR: 6
};

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
 * 改行を拒否し、明らかなメールアドレス形だけ通す。
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
 * スクリプトの「今日」を Asia/Tokyo の日付として返す。
 * @return {Date} 当日 0:00 JST 相当の Date
 */
function getTodayInTimezone() {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, Config.TIMEZONE, 'yyyy-MM-dd');
  return parseDateInTimezone_(dateStr, 0, 0, 0);
}

/**
 * @return {string}
 */
function todayLabel() {
  return Utilities.formatDate(getTodayInTimezone(), Config.TIMEZONE, 'yyyy-MM-dd');
}

/**
 * @param {string} yyyyMmDd
 * @param {number} hour
 * @param {number} minute
 * @param {number} second
 * @return {Date}
 */
function parseDateInTimezone_(yyyyMmDd, hour, minute, second) {
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
