export type Date8n = number;

export type TimeMillies = number;

export type Hour = number;

export type Minute = number;

/**
 * 시간 + 분 => ex) 1330 (오후1시), 1400 (오후2시)
 */
export type hhmm24 = number;

/**
 * 6000
 */
export const ONE_MINUTE: Minute = 1000 * 60;
/**
 * 360000
 */
export const ONE_HOUR: Hour = ONE_MINUTE * 60;
/**
 * 86400000
 */
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_YEAR = ONE_DAY * 365;

export enum TimeUnit {
  ONE_YEAR = 1000 * 60 * 60 * 24 * 365,
  ONE_DAY = 1000 * 60 * 60 * 24,
  ONE_HOUR = 1000 * 60 * 60,
  ONE_MINUTE = 1000 * 60,
}

export enum DayOfWeek {
  SUN = 0b0000001,
  MON = 0b0000010,
  TUE = 0b0000100,
  WED = 0b0001000,
  THU = 0b0010000,
  FRI = 0b0100000,
  SAT = 0b1000000,
}

export const SmsCollectionNamePrefix = "SMS";

export const mongoCollectionName = (collectionName: string): string =>
  collectionName;

export const PAYMENT_EXP_TIME_CARD = 20 * ONE_MINUTE;
export const PAYMENT_EXP_TIME_BANK_TRANSFER = ONE_DAY;

const _padStart = (d: string | number) => d.toString().padStart(2, "0");

export const dateToParts = (date: Date) => {
  return {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate(),
    h: date.getUTCHours(),
    i: date.getUTCMinutes(),
    s: date.getUTCSeconds(),
  };
};

export const formatDate = (date: Date, format = "%y%m%d%h%i%s") => {
  return format
    .replace(/%y/, date.getFullYear().toString())
    .replace(/%m/, _padStart(date.getUTCMonth() + 1))
    .replace(/%d/, _padStart(date.getUTCDate()))
    .replace(/%h/, _padStart(date.getUTCHours()))
    .replace(/%i/, _padStart(date.getUTCMinutes()))
    .replace(/%s/, _padStart(date.getUTCSeconds()));
};

export const date8nToTimemillies = (date8n: Date8n) => {
  if (date8n < 19000101) {
    throw new Error("연도가 너무 작음...");
  }
  const date = date8n % 100;
  const month = ((date8n % 10000) - date) / 100 - 1;
  const year = Math.floor(date8n / 10000);
  return new Date(year, month, date, 0, 0, 0, 0).getTime();
};

export const timemilliesToDate8n = (time: TimeMillies) => {
  const d = new Date(time);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const date = d.getUTCDate();

  return year * 10000 + month * 100 + date;
};

export const minuteOfDayToTimemillies = (minuteOfDay: number) => {
  return minuteOfDay * 60000;
};

export const getDayFromDate8n = (date8n: Date8n) => {
  if (date8n < 19000101) {
    throw new Error("연도가 너무 작음...");
  }
  const date = date8n % 100;
  const month = ((date8n % 10000) - date) / 100 - 1;
  const year = Math.floor(date8n / 10000);
  return new Date(year, month, date, 0, 0, 0, 0).getUTCDay();
};
