import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { createValidationError } from '../utils/errors';

/**
 * express-validatorのバリデーション結果をチェックし、エラーがあれば
 * 標準化されたエラーレスポンスを返すミドルウェア
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // リクエストに対して定義されたすべてのバリデーションを実行
    await Promise.all(validations.map(validation => validation.run(req)));

    // バリデーション結果を取得
    const errors = validationResult(req);
    
    // エラーがなければ次のミドルウェアに進む
    if (errors.isEmpty()) {
      return next();
    }

    // エラーがある場合は、標準フォーマットでエラーを返す
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : undefined,
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    // バリデーションエラーを生成して送信
    const validationError = createValidationError(
      'リクエストデータが無効です', 
      formattedErrors
    );
    
    res.status(validationError.statusCode).json(validationError.toResponse());
  };
};

/**
 * API レスポンスの標準成功フォーマット
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * 成功レスポンスをフォーマットする関数
 */
export const formatSuccessResponse = <T>(
  data: T, 
  message?: string
): SuccessResponse<T> => {
  return {
    success: true,
    data,
    ...(message && { message })
  };
};

/**
 * クエリパラメータでページネーション情報を取得するヘルパー関数
 */
export const getPaginationFromQuery = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  // デフォルト値は10、最大値は100
  let limit = parseInt(req.query.limit as string) || 10;
  if (limit > 100) limit = 100;
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};
