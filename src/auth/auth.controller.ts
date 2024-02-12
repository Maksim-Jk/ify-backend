import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Token, User } from '../user/entities'
import { RegisterDto } from './dto'
import { Cookies, Public, UserAgent } from '@app/common/decorators'
import { Response } from 'express'
import { AuthGuard } from '@app/common/guards'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: User })
  @Public()
  @Post('login')
  async login(@Body() dto: RegisterDto, @UserAgent() userAgent: string, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto, userAgent)
    this.setAuthHeadersAndCookies(res, accessToken, refreshToken)
    return res.status(200).json({ message: 'login success.' })
  }

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 200, type: User })
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Get('refresh-token')
  async refreshTokens(@Res() res: Response, @Cookies('refreshToken') token: Token) {
    if (!token) {
      throw new BadRequestException('Refresh token not found.')
    }
    const { accessToken, refreshToken } = await this.authService.refreshTokens(token)
    this.setAuthHeadersAndCookies(res, accessToken, refreshToken)
    res.status(200).json({ message: 'refresh token success.' })
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refreshToken')
    res.setHeader('Authorization', '')

    res.status(200).json({ message: 'logout success.' })
  }

  private setAuthHeadersAndCookies(res: Response, accessToken: string, refreshToken: Token) {
    res.setHeader('Authorization', `Bearer ${accessToken}`)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: process.env.NODE_ENV === 'production',
    })
  }
}
