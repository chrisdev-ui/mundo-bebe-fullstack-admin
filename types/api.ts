export interface ApiResponse<T = null> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  error?: Error;
}

export interface ApiError {
  code: string;
  message: string;
  cause?: string;
}
