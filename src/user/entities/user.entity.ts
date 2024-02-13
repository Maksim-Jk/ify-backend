import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Token } from './token.entity'
import { VerifiedUser } from './verified-user'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => Token, ({ user }) => user, { onDelete: 'CASCADE' })
  tokens: Token[]

  @OneToOne(() => VerifiedUser, ({ user }) => user, { onDelete: 'CASCADE' })
  verifiedUser: VerifiedUser
}
