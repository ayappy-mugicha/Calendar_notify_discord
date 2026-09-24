/**
 * 今日の Google カレンダー予定を Discord へ通知。
 */

/**
 * エントリ: Calendar のみ送信
 */
function notifyTodayCalendar() {
  var today = getTodayInTimezone();
  var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  var events = CalendarApp.getDefaultCalendar().getEvents(today, tomorrow);
  var fields = [];

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var title = event.getTitle() || '(無題)';
    var timeLabel = formatEventTime_(event);
    var location = event.getLocation() || '';
    var value = timeLabel;
    if (location) {
      value += '\n場所: ' + truncate_(location, 200);
    }
    fields.push({
      name: truncate_(title, 256),
      value: value,
      inline: false
    });
  }

  var dayLabel = Utilities.formatDate(today, Config.TIMEZONE, 'yyyy-MM-dd');
  var desc = dayLabel + ' の予定: ' + fields.length + ' 件';

  if (fields.length === 0) {
    deliverReport_('今日の予定', desc + '\n予定なし', [], 0x57f287);
    return { count: 0 };
  }

  deliverReport_('今日の予定', desc, fields, 0x57f287);
  return { count: fields.length };
}

/**
 * @param {CalendarEvent} event
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
