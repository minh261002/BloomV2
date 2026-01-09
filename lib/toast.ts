import { toast as sonnerToast, ExternalToast } from "sonner";

/**
 * Toast helper wrapper for Sonner
 * Use this helper instead of importing toast directly from sonner
 */
export const toast = {
  /**
   * Display a success toast
   */
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, options);
  },

  /**
   * Display an error toast
   */
  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, options);
  },

  /**
   * Display an info toast
   */
  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, options);
  },

  /**
   * Display a warning toast
   */
  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, options);
  },

  /**
   * Display a loading toast
   */
  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, options);
  },

  /**
   * Display a default toast
   */
  default: (message: string, options?: ExternalToast) => {
    return sonnerToast(message, options);
  },

  /**
   * Display a promise toast that updates based on promise state
   */
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    } & ExternalToast
  ) => {
    return sonnerToast.promise(promise, options);
  },

  /**
   * Dismiss a specific toast by id, or all toasts if no id provided
   */
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },

  /**
   * Custom toast with full control
   */
  custom: (
    jsx: (id: number | string) => React.ReactElement,
    options?: ExternalToast
  ) => {
    return sonnerToast.custom(jsx, options);
  },
};
