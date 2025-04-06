import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';
import { AppError, ErrorType, createInternalError } from '../utils/errors';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

/**
 * PrismaエラーをAppErrorに変換する関数
 */
export const handlePrismaError = (error: any): AppError => {
  // 詳細なエラー情報（開発環境用）
  const details = process.env.NODE_ENV === 'development' ? error : undefined;

  // PrismaのKnownRequestError (P2002はユニーク制約違反など)
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // ユニーク制約違反
        return new AppError(
          ErrorType.CONFLICT, 
          '一意制約違反: 同じ値が既に存在します', 
          {
            fields: error.meta?.target,
            code: error.code
          }
        );
      case 'P2025': // レコードが見つからない
        return new AppError(
          ErrorType.NOT_FOUND, 
          '指定されたレコードが見つかりません', 
          {
            details: error.meta,
            code: error.code
          }
        );
      default:
        return new AppError(
          ErrorType.DATABASE, 
          `データベースエラー: ${error.code}`, 
          details, 
          error.code
        );
    }
  }
  
  // PrismaのValidationError (主にスキーマ定義違反)
  if (error instanceof PrismaClientValidationError) {
    return new AppError(
      ErrorType.VALIDATION, 
      'データベースバリデーションエラー', 
      details
    );
  }
  
  // その他のデータベースエラー
  if (error.name === 'PrismaClientInitializationError') {
    return new AppError(
      ErrorType.DATABASE, 
      'データベース接続エラー', 
      details
    );
  }
  
  // デフォルトはデータベースエラーとして扱う
  return new AppError(
    ErrorType.DATABASE, 
    'データベースエラーが発生しました', 
    details
  );
};

/**
 * 第三者サービスのエラーをAppErrorに変換する関数
 */
export const handleExternalServiceError = (serviceName: string, error: any): AppError => {
  const details = process.env.NODE_ENV === 'development' ? error : undefined;
  const message = error.message || '外部サービスエラー';
  
  return new AppError(
    ErrorType.EXTERNAL_SERVICE,
    `${serviceName}: ${message}`,
    details
  );
};

/**
 * エラーハンドリングミドルウェア
 * Expressのエラーハンドリングミドルウェアの形式に合わせる (err, req, res, next)
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // すでにレスポンスが送信されている場合は、エラーをログに記録してミドルウェアチェーンを終了
  if (res.headersSent) {
    logger.error('エラーが発生しましたが、ヘッダーは既に送信されています', { error: err });
    return next(err);
  }

  // AppErrorの場合はそのまま使用
  let appError: AppError;
  
  if (err instanceof AppError) {
    appError = err;
  } else if (err.name?.includes('Prisma')) {
    // Prisma関連のエラー
    appError = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT関連エラー
    appError = new AppError(
      ErrorType.AUTHENTICATION, 
      'トークンが無効または期限切れです',
      { tokenError: err.message }
    );
  } else if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    // JSONのパースエラー
    appError = new AppError(
      ErrorType.BAD_REQUEST, 
      '無効なJSONフォーマットです',
      { syntaxError: err.message }
    );
  } else {
    // 未知のエラー（内部サーバーエラーとして扱う）
    appError = createInternalError('予期せぬエラーが発生しました', {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    
    // 開発環境ではコンソールにスタックトレースを表示
    if (process.env.NODE_ENV === 'development') {
      console.error('未ハンドルエラー:', err);
    }
  }

  // エラーレスポンスを送信
  res.status(appError.statusCode).json(appError.toResponse());
};

/**
 * 404エラー（Not Found）ハンドリングミドルウェア
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const appError = new AppError(
    ErrorType.NOT_FOUND,
    `パス ${req.originalUrl} が見つかりません`,
    { method: req.method, url: req.originalUrl }
  );
  
  res.status(StatusCodes.NOT_FOUND).json(appError.toResponse());
};
