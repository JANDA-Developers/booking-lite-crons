import { Prop } from '@typegoose/typegoose'
import { Hour } from '../../utils/dateUtils'

export class Timezone implements ITimezone {
  @Prop({ required: true })
  offset!: Hour

  @Prop({ required: true })
  label!: string
}

export interface ITimezone {
  offset: Hour
  label: string
}

export enum TimezoneEnum {
  ASIA_SEOUL = 'Asia/Seoul',
  ASIA_TOKYO = 'Asia/Tokyo',
  ASIA_SHANGHAI = 'Asia/Shanghai',
  ASIA_HONG_KONG = 'Asia/Hong_Kong',
}

export const TimezoneMap = new Map<TimezoneEnum, Timezone>([
  [
    TimezoneEnum.ASIA_TOKYO,
    {
      label: TimezoneEnum.ASIA_TOKYO.toString(),
      offset: 9
    }
  ],
  [
    TimezoneEnum.ASIA_SEOUL,
    {
      label: TimezoneEnum.ASIA_SEOUL.toString(),
      offset: 9
    }
  ],
  [
    TimezoneEnum.ASIA_HONG_KONG,
    {
      label: TimezoneEnum.ASIA_HONG_KONG.toString(),
      offset: 8
    }
  ],
  [
    TimezoneEnum.ASIA_TOKYO,
    {
      label: TimezoneEnum.ASIA_TOKYO.toString(),
      offset: 8
    }
  ]
])
