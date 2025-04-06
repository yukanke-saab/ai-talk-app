import { StatusCodes } from 'http-status-codes';
import logger from './logger';

/**
 * アプリケーション全体で使用するエラータイプの定義
 */
export enum ErrorType {
  // クライアントエラー (4xx)
  VALIDATION = 'VALIDATION_ERROR',       // 入力検証エラー
  AUTHENTICATION = 'AUTHENTICATION_ERROR', // 認証エラー
  AUTHORIZATION = 'AUTHORIZATION_ERROR',  // 認可エラー
  NOT_FOUND = 'NOT_FOUND_ERROR',        // リソースが見つからない
  CONFLICT = 'CONFLICT_ERROR',           // 競合エラー（重複など）
  BAD_REQUEST = 'BAD_REQUEST_ERROR',     // 一般的な不正リクエスト
  RATE_LIMIT = 'RATE_LIMIT_ERROR',       // レート制限エラー
  
  // サーバーエラー (5xx)
  INTERNAL = 'INTERNAL_SERVER_ERROR',    // 内部サーバーエラー
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR', // 外部サービスエラー
  DATABASE = 'DATABASE_ERROR',           // データベースエラー
}

/**
 * HTTP ステータスコードとエラータイプのマッピング
 */
export const ERROR_STATUS_MAP: Record<ErrorType, number> = {
  [ErrorType.VALIDATION]: StatusCodes.BAD_REQUEST,
  [ErrorType.AUTHENTICATION]: StatusCodes.UNAUTHORIZED,
  [ErrorType.AUTHORIZATION]: StatusCodes.FORBIDDEN,
  [ErrorType.NOT_FOUND]: StatusCodes.NOT_FOUND,
  [ErrorType.CONFLICT]: StatusCodes.CONFLICT,
  [ErrorType.BAD_REQUEST]: StatusCodes.BAD_REQUEST,
  [ErrorType.RATE_LIMIT]: StatusCodes.TOO_MANY_REQUESTS,
  [ErrorType.INTERNAL]: StatusCodes.INTERNAL_SERVER_ERROR,
  [ErrorType.EXTERNAL_SERVICE]: StatusCodes.BAD_GATEWAY,
  [ErrorType.DATABASE]: StatusCodes.INTERNAL_SERVER_ERROR,
};

/**
 * APIエラーレスポンスの標準形式
 */
export interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    details?: unknown;
    code?: string; // アプリケーション固有のエラーコード
  };
}

/**
 * アプリケーション共通のベースエラークラス
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    type: ErrorType,
    message: string,
    details?: unknown,
    code?: string,
    isOperational = true
  ) {
    super(message);
    
    this.type = type;
    this.statusCode = ERROR_STATUS_MAP[type];
    this.details = details;
    this.code = code;
    this.isOperational = isOperational; // プログラミングエラーと区別するために使用
    
    // Errorクラスを正しく拡張するための設定
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
    
    // ロギング
    this.logError();
  }

  /**
   * エラー情報をログに記録
   */
  private logError(): void {
    const logLevel = this.statusCode >= 500 ? 'error' : 'warn';
    const logMethod = logLevel === 'error' ? logger.error : logger.warn;
    
    logMethod(`[${this.type}] ${this.message}`, {
      statusCode: this.statusCode,
      details: this.details,
      code: this.code,
      stack: this.stack
    });
  }

  /**
   * APIレスポンス用のエラーオブジェクトを生成
   */
  public toResponse(): ErrorResponse {
    const error: any = {
      type: this.type,
      message: this.message,
    };
    
    if (this.details) {
      error.details = this.details;
    }
    
    if (this.code) {
      error.code = this.code;
    }
    
    return {
      success: false,
      error,
    };
  }
}

/**
 * 便利なエラー生成関数群
 */

// バリデーションエラー
export const createValidationError = (message: string, details?: unknown) => {
  return new AppError(ErrorType.VALIDATION, message, details);
};

// 認証エラー
export const createAuthenticationError = (message = '認証が必要です') => {
  return new AppError(ErrorType.AUTHENTICATION, message);
};

// 認可エラー
export const createAuthorizationError = (message = 'アクセス権限がありません') => {
  return new AppError(ErrorType.AUTHORIZATION, message);
};

// リソース未発見エラー
export const createNotFoundError = (resource: string, id?: string | number) => {
  const message = id 
    ? `${resource} (ID: ${id}) が見つかりません` 
    : `${resource} が見つかりません`;
  return new AppError(ErrorType.NOT_FOUND, message);
};

// 競合エラー
export const createConflictError = (message: string, details?: unknown) => {
  return new AppError(ErrorType.CONFLICT, message, details);
};

// 不正リクエストエラー
export const createBadRequestError = (message: string, details?: unknown) => {
  return new AppError(ErrorType.BAD_REQUEST, message, details);
};

// 内部サーバーエラー
export const createInternalError = (message = '内部サーバーエラーが発生しました', details?: unknown) => {
  return new AppError(ErrorType.INTERNAL, message, details, undefined, false);
};

// データベースエラー
export const createDatabaseError = (message: string, details?: unknown) => {
  return new AppError(ErrorType.DATABASE, message, details, undefined, false);
};

// 外部サービスエラー
export const createExternalServiceError = (service: string, message: string, details?: unknown) => {
  return new AppError(
    ErrorType.EXTERNAL_SERVICE, 
    `${service}との通信エラー: ${message}`, 
    details
  );
};

// レート制限エラー
export const createRateLimitError = (message = 'リクエスト制限を超えました。しばらく経ってから再試行してください。') => {
  return new AppError(ErrorType.RATE_LIMIT, message);
};
