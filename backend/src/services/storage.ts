import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 開発環境用の音声ファイル保存ディレクトリ
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * 音声データをストレージにアップロード
 * 本番環境ではS3などのクラウドストレージを使用
 * 開発環境ではローカルファイルシステムを使用
 * 
 * @param buffer アップロードするデータのバッファ
 * @param key ファイルの保存パス/名前
 * @returns ファイルのURL
 */
export const uploadToS3 = async (buffer: Buffer, key: string): Promise<string> => {
  // 開発環境ではローカルに保存
  if (process.env.NODE_ENV === 'development') {
    const filePath = path.join(UPLOADS_DIR, key);
    
    // 必要なディレクトリを作成
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // ファイルを書き込む
    fs.writeFileSync(filePath, buffer);
    
    // ローカルサーバーのURLを返す（mock用）
    return `http://localhost:8080/uploads/${key}`;
  }
  
  // 本番環境ではAWS S3にアップロード
  // 以下はAWS SDKを使用する場合の実装例
  /*
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME || 'ai-talk-app',
    Key: key,
    Body: buffer,
    ContentType: 'audio/mp3'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location;
  */
  
  // モック実装
  return `https://example.com/audio/${key}`;
};

/**
 * S3のファイルに対する署名付きURLを取得
 * 
 * @param key ファイルのキー
 * @param expiresIn URL有効期限（秒）
 * @returns 署名付きURL
 */
export const getSignedUrl = async (key: string, expiresIn = 3600): Promise<string> => {
  // 開発環境ではローカルのパスを返す
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:8080/uploads/${key}`;
  }
  
  // 本番環境ではAWS S3の署名付きURLを返す
  // 以下はAWS SDKを使用する場合の実装例
  /*
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME || 'ai-talk-app',
    Key: key,
    Expires: expiresIn
  };
  
  return s3.getSignedUrlPromise('getObject', params);
  */
  
  // モック実装
  return `https://example.com/audio/${key}?token=${uuidv4()}&expires=${Date.now() + expiresIn * 1000}`;
};
