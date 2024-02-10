import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date

  @OneToMany(() => Token, (token) => token.user, { onDelete: 'CASCADE' })
  tokens: Token[]
}


@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  token: string

  @Column({ name: 'expires_at' })
  expiresAt: Date

  @Column({ name: 'user_agent' })
  userAgent: string

  @Column({ name: 'user_id', type: 'uuid' })
  @JoinColumn({ name: 'user_id' })
  userId: string

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: User
}