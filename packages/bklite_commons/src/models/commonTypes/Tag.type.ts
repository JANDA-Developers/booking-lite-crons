import { Prop } from '@typegoose/typegoose'

export class Tag {
  constructor (key: string, value: string) {
    this.key = key
    this.value = value
  }

  @Prop()
  key: string

  @Prop()
  value: string
}
