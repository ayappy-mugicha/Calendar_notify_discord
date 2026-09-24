# Calendar Notify Google Chat (GAS)

昨日 20:00〜今日 6:00（JST）の **重要メール** と、**今日のカレンダー予定** を Google Chat の Incoming Webhook へ通知する Google Apps Script です。

このディレクトリは Discord 版とは別プロジェクトです。`clasp` は `google-chat/` で実行します。Webhook URL は Script Properties に置き、git には含めません。

## 導入方法

前提: Google アカウント、通知先スペースの管理権限、Node.js（clasp 用）。

1. リポジトリを clone し、ブランチ `notify-google-chat-gmail` を使う。
2. [Apps Script API](https://script.google.com/home/usersettings) を ON にする。
3. `npm install -g @google/clasp` のあと `clasp login` する。
4. `google-chat/` で `clasp create --type standalone --title "Calendar_notify_google_chat" --rootDir ./src`。
5. **`clasp create` のあと** `src/appsscript.json` の `timeZone` が `Asia/Tokyo` であることを確認する（上書きされて `America/New_York` になることがある）。oauthScopes が消えていたら下記「設定」の値を戻す。
6. `google-chat/` で `clasp push` する。
7. Apps Script のスクリプト プロパティに `GOOGLE_CHAT_WEBHOOK_URL` を設定する（値は Chat のウェブフック URL。**コードや git には書かない**）。
8. エディタで `runGmailNotify` と `runCalendarNotify` を一度ずつ実行し、権限を承認する。
9. `createDailyTrigger` を一度実行し、毎日 6:00（`Asia/Tokyo`）に `runAll` が走ることを確認する。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/Config.gs` | タイムゾーン・`ENABLE_GMAIL` / `ENABLE_CALENDAR`・Webhook プロパティ名 |
| `src/GoogleChat.gs` | Incoming Webhook POST（`text`、4000 文字で分割） |
| `src/GmailNotify.gs` | 重要メール取得と通知 |
| `src/CalendarNotify.gs` | 今日の予定取得と通知 |
| `src/Main.gs` | `runGmailNotify` / `runCalendarNotify` / `runAll` / 日次トリガー |
| `src/appsscript.json` | `Asia/Tokyo` と OAuth スコープ |

## Google Chat Webhook

1. 通知先スペースを開く → スペース名の横 → **アプリと統合** → **ウェブフック** → **ウェブフックを追加**
2. 名前を付けて URL をコピーする（`https://chat.googleapis.com/` で始まる）
3. Apps Script → プロジェクトの設定 → スクリプト プロパティ
   - キー: `GOOGLE_CHAT_WEBHOOK_URL`
   - 値: （コピーした URL。**リポジトリやコードには書かない**）

## 使い方

エディタで次を個別に実行します。初回は権限承認が必要です。

- `runGmailNotify` … 昨日 20:00〜今日 6:00 JST の重要メールのみ
- `runCalendarNotify` … 今日（JST 0:00〜翌日 0:00）の予定のみ
- `runAll` … `Config.ENABLE_*` が `true` の通知だけ送信
- `createDailyTrigger` … 毎日 6:00 JST に `runAll` を設定（既存の同名トリガーは置き換え）

0 件のときは「該当なし」を送ります。ログには件数だけ出します。

## 設定

| 名前 | 必須 | 既定値 | 説明 |
|---|---|---|---|
| `GOOGLE_CHAT_WEBHOOK_URL` | はい | なし | Script Properties。Incoming Webhook の URL |
| `Config.TIMEZONE` | はい | `Asia/Tokyo` | `src/Config.gs` と `src/appsscript.json` の両方 |
| `Config.ENABLE_GMAIL` | いいえ | `true` | `runAll` で Gmail 通知を送るか |
| `Config.ENABLE_CALENDAR` | いいえ | `true` | `runAll` で Calendar 通知を送るか |

## 開発

`google-chat/` で:

```bash
clasp push
```

`.clasprc.json` と `.env` は gitignore 済みです。Webhook URL をコミットしないでください。`.clasp.json` の `scriptId` は `clasp create` 後に入ります。空のまま push しないでください。
