import { message } from 'antd';
import { ApiError } from '@/types/api';

export class AppError extends Error {
  public code: string;
  public statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleApiError = (error: any): AppError => {
  // Handle Axios errors
  if (error.response) {
    const apiError: ApiError = error.response.data;
    return new AppError(
      apiError.error?.message || 'An API error occurred',
      apiError.error?.code || 'API_ERROR',
      error.response.status
    );
  }

  // Handle network errors
  if (error.request) {
    return new AppError('Network error - please check your connection', 'NETWORK_ERROR');
  }

  // Handle other errors
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR');
};

export const showErrorMessage = (error: AppError | Error | string) => {
  let errorMessage: string;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof AppError) {
    errorMessage = error.message;
  } else {
    errorMessage = error.message || 'An unexpected error occurred';
  }

  message.error(errorMessage);
};

export const showSuccessMessage = (msg: string) => {
  message.success(msg);
};

export const showWarningMessage = (msg: string) => {
  message.warning(msg);
};

export const showInfoMessage = (msg: string) => {
  message.info(msg);
};