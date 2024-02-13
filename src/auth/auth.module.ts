import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../user/user.module'
import { JwtModule } from '@nestjs/jwt'
import { options } from './config'
import { AuthGuard } from '@app/common/guards'
import { EmailService } from '../email/email.service'
import { EmailModule } from '../email/email.module'
import { UserService } from '../user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Token, User, VerifiedUser } from '../user/entities'

@Module({
  imports: [UserModule, EmailModule, JwtModule.registerAsync(options())],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
