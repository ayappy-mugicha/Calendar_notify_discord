# Calendar Notify Discord (GAS)

昨日 20:00〜今日 6:00（JST）の **重要メール** と、**今日のカレンダー予定** を Discord Incoming Webhook へ通知する Google Apps Script です。

Gmail と Calendar は別ファイルに分かれており、個別実行もまとめて実行もできます。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/Config.gs` | タイムゾーン・`ENABLE_GMAIL` / `ENABLE_CALENDAR` 切替・Webhook プロパティ名 |
| `src/Discord.gs` | Incoming Webhook POST |
| `src/GmailNotify.gs` | 重要メール取得と通知 |
| `src/CalendarNotify.gs` | 今日の予定取得と通知 |
| `src/Main.gs` | `runGmailNotify` / `runCalendarNotify` / `runAll` / 日次トリガー |
| `src/appsscript.json` | `Asia/Tokyo` と OAuth スコープ |

## セットアップ

### 1. clasp で push（推奨）

Apps Script プロジェクト（作成済み）:  
https://script.google.com/d/1mpxiQucjznYIfl2SFwfWGzCuY0ALzj3dkVJrS1hlLG_gM1IvPc-APZef/edit

更新時はリポジトリ直下で:

```bash
clasp push
```

初回のみ [Apps Script API](https://script.google.com/home/usersettings) を ON にし、`clasp login` してから `clasp create` / `clasp push` する。`clasp create` は `src/appsscript.json` の `timeZone` を上書きすることがあるので、push 前に `Asia/Tokyo` であることを確認する。

### 1b. 手動で作る場合

1. [script.google.com](https://script.google.com/) で新規プロジェクトを作成
2. `src/` 内の `.gs` を同名ファイルとして貼り付け
3. `src/appsscript.json` をプロジェクト設定のマニフェストに反映

### 2. Discord Webhook

1. Discord サーバー設定 → 連携サービス → ウェブフック → 新しいウェブフック
2. URL をコピー
3. Apps Script → プロジェクトの設定 → スクリプト プロパティ
   - キー: `DISCORD_WEBHOOK_URL`
   - 値: （コピーした URL。**リポジトリやコードには書かない**）

### 3. 権限と動作確認

エディタで次を個別に実行し、初回は権限を承認します。

- `runGmailNotify` … 重要メールのみ
- `runCalendarNotify` … 今日の予定のみ
- `runAll` … `Config.ENABLE_*` が `true` の通知だけ送信

### 4. 毎日 6:00 に自動実行

エディタで `createDailyTrigger` を一度実行します（タイムゾーンは `Asia/Tokyo`）。

## 切替方法

- **単体送信**: `runGmailNotify` または `runCalendarNotify` を実行
- **まとめて切替**: `src/Config.gs` の `ENABLE_GMAIL` / `ENABLE_CALENDAR` を `true` / `false` にして `runAll`

## Google Drive

ソース一式のバックアップは Drive フォルダ `program/Calendar_notify_discord` に保存します（本物の Apps Script プロジェクト MIME ではないテキストバックアップ）。

## 注意

- Webhook URL を git にコミットしないでください
- Gmail 検索の `after:` / `before:` は日付粒度のため、時刻はスクリプト側で厳密にフィルタしています
