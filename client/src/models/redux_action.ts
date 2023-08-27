export interface ReduxAction<T> {
  type: string;
  data: T;
}