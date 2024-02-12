import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { User } from './user.entity'

@Entity()
export class Token {
  @PrimaryColumn()
  token: string

  @Column({ name: 'expires_at' })
  expiresAt: Date

  @Column({ name: 'user_agent' })
  userAgent: string

  @Column({ name: 'user_id' })
  userId: string

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: User
}
