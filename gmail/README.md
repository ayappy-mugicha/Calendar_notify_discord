# Calendar Notify Gmail (GAS)

昨日 20:00〜今日 6:00（JST）の **重要メール** と、**今日のカレンダー予定** を、自分宛の平文メールで届ける Google Apps Script です。

このディレクトリは Discord 版とは別プロジェクトです。`clasp` は `gmail/` で実行します。宛先の上書きアドレスは Script Properties に置き、git には含めません。

## 導入方法

前提: Google アカウント、Node.js（clasp 用）。

1. リポジトリを clone し、ブランチ `notify-google-chat-gmail` を使う。
2. [Apps Script API](https://script.google.com/home/usersettings) を ON にする。
3. `npm install -g @google/clasp` のあと `clasp login` する。
4. `gmail/` で `clasp create --type standalone --title "Calendar_notify_gmail" --rootDir ./src`。
5. **`clasp create` のあと** `src/appsscript.json` の `timeZone` が `Asia/Tokyo` であることを確認する（上書きされて `America/New_York` になることがある）。oauthScopes が消えていたら下記「設定」の値を戻す。
6. `gmail/` で `clasp push` する。
7. 送り先を変えるときだけ、スクリプト プロパティに `NOTIFY_EMAIL` を設定する。未設定ならスクリプト所有者へ送る。
8. エディタで `runGmailNotify` と `runCalendarNotify` を一度ずつ実行し、権限を承認する。
9. `createDailyTrigger` を一度実行し、毎日 6:00（`Asia/Tokyo`）に `runAll` が走ることを確認する。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/Config.gs` | タイムゾーン・`ENABLE_*`・送信先 |
| `src/MailNotify.gs` | `MailApp.sendEmail` と本文の組み立て |
| `src/GmailNotify.gs` | 重要メール取得 |
| `src/CalendarNotify.gs` | 今日の予定取得 |
| `src/Main.gs` | `runGmailNotify` / `runCalendarNotify` / `runAll` / 日次トリガー |
| `src/appsscript.json` | `Asia/Tokyo` と OAuth スコープ |

## 使い方

エディタで次を個別に実行します。初回は権限承認が必要です。

- `runGmailNotify` … 昨日 20:00〜今日 6:00 JST の重要メールだけを 1 通送る
- `runCalendarNotify` … 今日（JST 0:00〜翌日 0:00）の予定だけを 1 通送る
- `runAll` … 有効な節を件名 `朝の通知 yyyy-MM-dd` の 1 通にまとめて送る
- `createDailyTrigger` … 毎日 6:00 JST に `runAll` を設定（既存の同名トリガーは置き換え）

0 件の節も「該当なし」を含めます。ログには件数だけ出します。件名と本文はログに出しません。

## 設定

| 名前 | 必須 | 既定値 | 説明 |
|---|---|---|---|
| `NOTIFY_EMAIL` | いいえ | スクリプト所有者 | Script Properties。送り先を上書きするときだけ |
| `Config.TIMEZONE` | はい | `Asia/Tokyo` | `src/Config.gs` と `src/appsscript.json` の両方 |
| `Config.ENABLE_GMAIL` | いいえ | `true` | `runAll` に重要メールの節を含めるか |
| `Config.ENABLE_CALENDAR` | いいえ | `true` | `runAll` に今日の予定の節を含めるか |
| `userinfo.email` | はい | マニフェスト済み | `NOTIFY_EMAIL` 未設定時に所有者アドレスを取るスコープ |

## 開発

`gmail/` で:

```bash
clasp push
```

`.clasprc.json` と `.env` は gitignore 済みです。`.clasp.json` の `scriptId` は `clasp create` 後に入ります。空のまま push しないでください。
