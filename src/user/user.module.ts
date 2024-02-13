import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User, Token, VerifiedUser } from './entities'

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, VerifiedUser])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
