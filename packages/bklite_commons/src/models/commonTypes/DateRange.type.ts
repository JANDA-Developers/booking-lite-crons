import { DocumentType, Prop } from '@typegoose/typegoose'
import { MongoLong } from '../../types'
import {
  hhmm24,
  ONE_DAY,
  ONE_HOUR,
  ONE_MINUTE,
  TimeMillies
} from '../../utils/dateUtils'

export class DateRange {
  @Prop({
    type: MongoLong,
    required (this: DocumentType<DateRange>) {
      return this.to == null
    }
  })
  from?: TimeMillies

  @Prop({
    type: MongoLong,
    required (this: DocumentType<DateRange>) {
      return this.from == null
    }
  })
  to?: TimeMillies

  toString (): string {
    return `${this.from != null ? 'from:' + this.from.toString() : ''}${
      this.to != null ? '__to:' + this.to.toString() : ''
    }`
  }
}

export class TimeRange {
  @Prop({ required: true })
  start!: hhmm24

  @Prop({ required: true })
  end!: hhmm24

  toString (): string {
    return `${this.start}_${this.end}`
  }

  toDateRange (this: TimeRange, dateTimeMillies: TimeMillies = Date.now()): DateRange {
    const dateWithoutHour = dateTimeMillies - (dateTimeMillies % ONE_DAY)
    const from = hhmm24ToTimeMillies(this.start, dateWithoutHour)
    const to = hhmm24ToTimeMillies(this.end, dateWithoutHour)
    return Object.assign(new DateRange(), {
      from,
      to
    })
  }
}

/**
 * hh:mm 24시간 타입을 millisecond 단위의 시간으로 변경
 */
const hhmm24ToTimeMillies = (
  time: hhmm24,
  dateWithoutHour: number,
  offsetHour = 9
): TimeMillies => {
  if (time < 0) {
    throw new Error("'Time' is cannot be under 0")
  }
  const minute = time % 100
  const hour = (time - minute) / 1_00
  return dateWithoutHour + (hour - offsetHour) * ONE_HOUR + minute * ONE_MINUTE
}

/**
 * timeRange => DateRange 로 바꿔주는 마법의 함수
 * @param timeRange
 * @param date default: 현재 시간
 */
export const toDateRange = (
  timeRange: TimeRange,
  date: Date = new Date()
): DateRange => {
  const dateWithoutHour = date.getTime() - (date.getTime() % ONE_DAY)
  const from = hhmm24ToTimeMillies(timeRange.start, dateWithoutHour)
  const to = hhmm24ToTimeMillies(timeRange.end, dateWithoutHour)
  return Object.assign(new DateRange(), {
    from,
    to
  })
}
