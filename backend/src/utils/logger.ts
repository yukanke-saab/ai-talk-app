import winston from 'winston';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Winstonの型定義を拡張
declare module 'winston' {
  interface Logger {
    logRequest(req: Request, res: Response, next: NextFunction): void;
    security(message: string, meta?: any): void;
  }
}

// 環境変数からログレベルを取得（デフォルトは'info'）
const logLevel = process.env.LOG_LEVEL || 'info';

// ロギングディレクトリの作成を試みる
import fs from 'fs';
if (process.env.NODE_ENV === 'production') {
  try {
    if (!fs.existsSync(path.join(__dirname, '../../../logs'))) {
      fs.mkdirSync(path.join(__dirname, '../../../logs'), { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// ログファイルのパス（開発環境ではログディレクトリにファイル出力、本番環境では適宜変更）
const logDir = path.join(__dirname, '../../../logs');

/**
 * カスタムログフォーマット（トランスポート共通）
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...rest } = info;
    const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${restString}`;
  })
);

/**
 * カラー付きコンソール出力用フォーマット（開発環境用）
 */
const coloredConsoleFormat = winston.format.combine(
  winston.format.colorize(),
  customFormat
);

/**
 * トランスポート設定
 * - 開発環境: カラー付きコンソール出力（詳細）
 * - 本番環境: コンソール（警告以上）+ ファイル出力（全ログ）
 */
const transports = [];

// コンソール出力（すべての環境）
transports.push(
  new winston.transports.Console({
    format: coloredConsoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'warn' : logLevel,
  })
);

// ファイル出力（本番環境のみ）
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: logLevel,
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * ロガーインスタンス
 */
const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  defaultMeta: { service: 'ai-talk-app' },
  transports,
  exitOnError: false,
});

// リクエストロギング用のメソッド
logger.logRequest = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // レスポンス終了時にログを出力するイベントリスナー
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    // ステータスコードに応じてログレベルを変える
    if (res.statusCode >= 500) {
      logger.error(message, { 
        ip: req.ip, 
        userId: req.user?.id || 'anonymous',
        userAgent: req.get('User-Agent')
      });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { 
        ip: req.ip,
        userId: req.user?.id || 'anonymous' 
      });
    } else {
      logger.info(message, { 
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
      });
    }
  });
  
  next();
};

// 要注意イベント（認証失敗など）専用
logger.security = (message: string, meta?: any) => {
  logger.warn(`[SECURITY] ${message}`, meta);
};

export default logger;
