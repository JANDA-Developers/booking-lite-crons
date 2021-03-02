export interface EventType {
  greeting: string;
}

export interface ResponseType<T> {
  ok: boolean;
  error: any;
  data?: T;
}
