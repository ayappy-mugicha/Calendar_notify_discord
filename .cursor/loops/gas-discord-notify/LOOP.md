# Loop: gas-discord-notify

## 1文
エージェントが、GASソースをローカルに作成し Drive `program` へアップロードし、検証証拠付きでコミットしたら止める。

## 型
ゴール型

## トリガー
ユーザーによる計画の実装指示

## 成功（全部満たす）
- [ ] `src/Config.gs` `Discord.gs` `GmailNotify.gs` `CalendarNotify.gs` `Main.gs` と `appsscript.json` `README.md` が存在する
- [ ] Gmail / Calendar が別ファイルで、`runGmailNotify` / `runCalendarNotify` から単体送信できる
- [ ] Drive の `program/Calendar_notify_discord` 配下に同内容がある（`search_files` で確認）
- [ ] `git commit` 完了（push なし）

## 失敗（どれかで停止）
- [ ] 同じ根本原因が3回
- [ ] Drive 権限不足でアップロードできない
- [ ] Webhook URL 実値をコミットしようとした

## 予算
- 最大試行: 5
- 同一失敗の再実行: 禁止

## 危険（即停止）
- 秘密のコミット、未承認の push / deploy、force push、本番破壊

## 検証
- スキル: loop-engineering / commit
- コマンド:
  ```
  Get-ChildItem -Recurse src, appsscript.json, README.md
  Drive search_files (program / Calendar_notify_discord)
  git status
  ```
- 自己申告で完了にしない

## メモリ
- STATE: `.cursor/loops/gas-discord-notify/STATE.md`

## Maker / Checker
- Maker: この会話
- Checker: なし（構造・Drive・git の現行証拠で検証）
- Worktree: 使わない

## 昇格条件
ターン型で検証が安定 → ゴール型で自走 → 時間型または Automation
