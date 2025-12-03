## Google Drive 自動クリーンアップ（GAS）

### 概要
- **指定したフォルダ配下**にある Google ファイル（スライド / スプレッドシート / ドキュメント）のうち、
  - **一定日数以上更新されていないもの**を対象に
  - **ファイル ID で除外指定したものをスキップ**しながら
  - 対象ファイルを **ゴミ箱へ移動（削除）** する Google Apps Script です。
- 実行対象は 1 つのフォルダのみですが、そのフォルダ直下のすべてのファイルがチェックされます（サブフォルダ内は対象外）。

スクリプト本体は `google-drive-cleanup.gs` の `cleanupDriveFiles()` 関数です。

---

### 設定項目（`cleanupDriveFiles()` 冒頭）

- **`TARGET_FOLDER_ID`**
  - 説明: 削除対象とする Google Drive フォルダの ID。
  - 例: `https://drive.google.com/drive/folders/XXXXXXXX` の `XXXXXXXX` の部分。
  - 必須: 必ず実際のフォルダ ID に書き換えてください。

- **`EXCLUDED_FILE_IDS`**
  - 説明: 削除対象から除外したいファイルの **ファイル ID の配列**。
  - 例: `['FILE_ID_1', 'FILE_ID_2']`
  - 指定した ID のファイルは、対象フォルダ内にあっても削除されません。

- **`RETENTION_DAYS`**
  - 説明: 「**最終更新から何日経過したファイルを削除対象とするか**」を指定します。
  - 例: `30` とした場合、「最終更新日時が 30 日より前」のファイルが削除候補になります。

- **`DELETE_SLIDES` / `DELETE_SHEETS` / `DELETE_DOCS`**
  - 説明: どの種類の Google ファイルを削除対象にするかのフラグ（`true` or `false`）。
  - `DELETE_SLIDES`: Google スライド（`MimeType.GOOGLE_SLIDES`）
  - `DELETE_SHEETS`: スプレッドシート（`MimeType.GOOGLE_SHEETS`）
  - `DELETE_DOCS`: Google ドキュメント（`MimeType.GOOGLE_DOCS`）
  - 例: スライドとスプレッドシートだけ削除し、ドキュメントは残す場合  
    - `DELETE_SLIDES = true;`  
    - `DELETE_SHEETS = true;`  
    - `DELETE_DOCS   = false;`

---

### 動作イメージ
1. `TARGET_FOLDER_ID` で指定したフォルダを取得
2. フォルダ直下のファイルを 1 件ずつ走査
3. 各ファイルについて以下を判定
   - MIME タイプがスライド / シート / ドキュメントのどれか？
   - その種類がフラグ（`DELETE_*`）で削除対象に含まれているか？
   - ファイル ID が `EXCLUDED_FILE_IDS` に含まれていないか？
   - `file.getLastUpdated()` が、`RETENTION_DAYS` で計算したしきい値より古いか？
4. すべての条件を満たしたファイルだけを `file.setTrashed(true)` でゴミ箱へ移動し、`Logger.log` に結果を出力

---

### 利用手順（ざっくり）
1. Google Apps Script（GAS）エディタでこのプロジェクトを開く
2. `google-drive-cleanup.gs` 内の設定値を環境に合わせて編集
3. メニューから実行関数として `cleanupDriveFiles` を選択して実行
4. 初回実行時は Drive へのアクセス権限付与の認可フローを完了する
5. 実行結果・削除されたファイルは `実行ログ（Logger.log）` で確認

