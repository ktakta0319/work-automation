/**
 * Google Drive内の特定フォルダから、指定した種類のGoogleファイルを削除するユーティリティ
 * - フォルダ ID を指定して削除対象の範囲を固定
 * - 除外したいファイルのファイルIDをリストで指定
 * - 最終更新から何日経過したファイルを削除対象とするか指定
 * - スライド / スプレッドシート / ドキュメントのどれを削除対象にするかをフラグで指定
 */
function cleanupDriveFiles() {
  // ===== 設定値 =====
  const TARGET_FOLDER_ID = 'PUT_FOLDER_ID_HERE'; // 削除対象のフォルダID
  const EXCLUDED_FILE_IDS = ['KEEP_THIS_FILE_ID']; // 削除対象外のファイルID
  const RETENTION_DAYS = 30; // この日数より前に作成されたファイルを削除対象とする

  // 削除対象とするファイル種別（true にしたものだけを削除）
  const DELETE_SLIDES = true;   // Google スライド
  const DELETE_SHEETS = true;   // スプレッドシート
  const DELETE_DOCS   = false;  // Google ドキュメント

  // ===== 削除ロジック =====
  // 削除対象のMIMEタイプの配列を作成
  const TARGET_MIME_TYPES = [];
  if (DELETE_SLIDES) TARGET_MIME_TYPES.push(MimeType.GOOGLE_SLIDES);
  if (DELETE_SHEETS) TARGET_MIME_TYPES.push(MimeType.GOOGLE_SHEETS);
  if (DELETE_DOCS)   TARGET_MIME_TYPES.push(MimeType.GOOGLE_DOCS);
  
  const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  const now = new Date();
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  // const cutoff = new Date(now.getTime() - 60 * 1000); // テスト用に作成から1分経過したファイルを削除対象に

  // 削除対象フォルダ内のファイルを1つずつチェック
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();

    // MIMEタイプが対象外ならスキップ
    if (!TARGET_MIME_TYPES.includes(file.getMimeType())) {
      continue;
    }

    // 除外IDならスキップ
    if (EXCLUDED_FILE_IDS.includes(file.getId())) {
      continue;
    }

    // 最終更新日時が新しい場合はスキップ
    if (file.getLastUpdated() >= cutoff) {
      continue;
    }

    // 削除（ゴミ箱へ）
    file.setTrashed(true);
    Logger.log(
      'Deleted file: %s (%s) [%s] last updated: %s',
      file.getName(),
      file.getId(),
      file.getMimeType(),
      file.getLastUpdated()
    );
  }
}
