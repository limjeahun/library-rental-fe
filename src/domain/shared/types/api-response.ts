export type BaseResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type FieldError = {
  field: string;
  message: string;
};

export type ErrorResponse = {
  code?: string | number;
  message?: string;
  fieldErrors?: FieldError[];
};

export type ApiMeta = {
  code: number;
  message: string;
};
