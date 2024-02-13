import { BadRequestException, Body, Controller, Get, Param, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Token, User, VerifiedUser } from '../user/entities'
import { RegisterDto, VerifyCodeDto } from './dto'
import { Cookies, Public, UserAgent } from '@app/common/decorators'
import { Response } from 'express'
import { EmailService } from '../email/email.service'
import { UserService } from '../user/user.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { add } from 'date-fns/add'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private readonly userService: UserService,
    @InjectRepository(VerifiedUser)
    private readonly verifiedRepository: Repository<VerifiedUser>,
  ) {}

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
  async register(@Body() dto: RegisterDto) {
    const { email, id } = await this.authService.register(dto)
    await this.verify(email, id)
    return { message: 'register success.' }
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Refresh token success.' })
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

  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout success.' })
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refreshToken')
    res.setHeader('Authorization', '')

    res.status(200).json({ message: 'logout success.' })
  }

  @Public()
  @Post('verify')
  async verifyCode(
    @Body() dto: VerifyCodeDto,
    @Res() res: Response,
    @UserAgent() userAgent: string,
  ) {
    const { id } = await this.userService.findByIdOrEmail(dto.email, true)
    const verified = await this.verifiedRepository.findOne({ where: { userId: id } })

    if (verified.code !== dto.code || verified.expiresAt < new Date()) {
      throw new BadRequestException('Verify code is not valid')
    }
    verified.verified = true
    await this.verifiedRepository.save(verified)
    const { accessToken, refreshToken } = await this.authService.getNewTokens(id, userAgent)
    this.setAuthHeadersAndCookies(res, accessToken, refreshToken)
    return res.status(200).json({ message: 'verify success.' })
  }

  @Public()
  @Get('send-verify/:email')
  async sendVerify(@Param('email') email: string) {
    const { id } = await this.userService.findByIdOrEmail(email)
    await this.verify(email, id)
    return { message: 'send verify code success.' }
  }

  // --------------------------------------------

  private setAuthHeadersAndCookies(res: Response, accessToken: string, refreshToken: Token) {
    res.setHeader('Authorization', `Bearer ${accessToken}`)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: process.env.NODE_ENV === 'production',
    })
  }

  private async verify(email: string, id: string) {
    const createCode = () => Math.floor(100000 + Math.random() * 900000)
    const code = createCode()

    const verified = await this.verifiedRepository.findOneBy({ userId: id })
    const updatedData = { code, expiresAt: add(new Date(), { minutes: 10 }) }

    await this.emailService.sendMail({ email, code })
    if (verified) {
      await this.verifiedRepository.update({ userId: id }, updatedData)
    } else {
      this.verifiedRepository.save({ userId: id, ...updatedData }).catch(() => {
        throw new BadRequestException("Can't create verify code")
      })
    }
  }
}
