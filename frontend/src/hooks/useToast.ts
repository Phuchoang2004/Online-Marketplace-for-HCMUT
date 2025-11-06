import { App } from 'antd';
import { AppError } from '@/utils/error';

export const useToast = () => {
  const { message, notification, modal } = App.useApp();

  const showErrorMessage = (error: AppError | Error | string) => {
    let errorMessage: string;
    if (typeof error === 'string') {
      errorMessage = error;
    } else if ((error as AppError).code) {
      errorMessage = (error as AppError).message;
    } else {
      errorMessage = (error as Error)?.message || 'An unexpected error occurred';
    }
    message.error(errorMessage);
  };

  const showSuccessMessage = (msg: string) => message.success(msg);
  const showWarningMessage = (msg: string) => message.warning(msg);
  const showInfoMessage = (msg: string) => message.info(msg);

  return { message, notification, modal, showErrorMessage, showSuccessMessage, showWarningMessage, showInfoMessage };
};


