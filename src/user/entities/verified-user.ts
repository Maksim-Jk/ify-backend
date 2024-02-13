import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { User } from './user.entity'
import { add } from 'date-fns/add'

@Entity()
export class VerifiedUser {
  @PrimaryColumn()
  code: number

  @Column({ default: false })
  verified: boolean

  @Column({ name: 'expires_at', default: add(new Date(), { minutes: 15 }) })
  expiresAt: Date

  @Column({ name: 'user_id' })
  userId: string

  @OneToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: User
}
