import multer from 'multer';
import path from 'path';
import os from 'os';

// 一時ディレクトリに音声ファイルを保存するストレージを設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir()); // OSの一時ディレクトリを使用
  },
  filename: (req, file, cb) => {
    // ユニークなファイル名を生成
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

// 音声ファイルのみ受け付けるよう制限
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // MIME typeで音声ファイルかチェック
  if (
    file.mimetype === 'audio/webm' ||
    file.mimetype === 'audio/mpeg' ||
    file.mimetype === 'audio/mp4' ||
    file.mimetype === 'audio/wav' ||
    file.mimetype === 'audio/ogg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイル形式です。音声ファイル（webm, mp3, mp4, wav, ogg）のみ受け付けます。'));
  }
};

// Multerの設定
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 最大10MB
  }
});

export default upload;
