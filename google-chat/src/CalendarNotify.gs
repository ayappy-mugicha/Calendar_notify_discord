/**
 * 今日の Google カレンダー予定を Google Chat へ通知。
 */

/**
 * エントリ: Calendar のみ送信
 * @return {{count: number}}
 */
function notifyTodayCalendar() {
  var report = collectTodayCalendar_();
  sendGoogleChatReport(report.title, report.description, report.blocks);
  return { count: report.count };
}

/**
 * @return {{title: string, description: string, blocks: string[], count: number}}
 */
function collectTodayCalendar_() {
  var today = getTodayInTimezone();
  var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  var events = CalendarApp.getDefaultCalendar().getEvents(today, tomorrow);
  var blocks = [];

  for (var i = 0; i < events.length; i++) {
    blocks.push(formatEventBlock_(events[i]));
  }

  var dayLabel = Utilities.formatDate(today, Config.TIMEZONE, 'yyyy-MM-dd');
  return {
    title: '今日の予定',
    description: dayLabel + ' の予定: ' + blocks.length + ' 件',
    blocks: blocks,
    count: blocks.length
  };
}

/**
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event
 * @return {string}
 */
function formatEventBlock_(event) {
  var title = event.getTitle() || '(無題)';
  var value = truncate_(title, 200) + '\n' + formatEventTime_(event);
  var location = event.getLocation() || '';
  if (location) {
    value += '\n場所: ' + truncate_(location, 200);
  }
  return value;
}

/**
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event
 * @return {string}
 */
function formatEventTime_(event) {
  if (event.isAllDayEvent()) {
    return '終日';
  }
  var start = Utilities.formatDate(
    event.getStartTime(),
    Config.TIMEZONE,
    'HH:mm'
  );
  var end = Utilities.formatDate(event.getEndTime(), Config.TIMEZONE, 'HH:mm');
  return start + ' 〜 ' + end;
}
