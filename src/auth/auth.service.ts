import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserService } from '../user/user.service'
import { RegisterDto } from './dto'
import { compareSync } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { Token, User, VerifiedUser } from '../user/entities'
import { v4 } from 'uuid'
import { add } from 'date-fns/add'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto) {
    return this.userService.save(dto).catch((err) => {
      this.logger.error(err)
      throw new BadRequestException('User already exists')
    })
  }

  public async login(dto: RegisterDto, userAgent: string) {
    const user = await this.userService.findByIdOrEmail(dto.email, true)

    if (!user || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('The email or password is incorrect.')
    }
    return this.getNewTokens(user.id, userAgent)
  }

  public async refreshTokens(refreshToken: Token) {
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new BadRequestException('Refresh token expired')
    }

    const { id } = await this.userService.findByIdOrEmail(refreshToken.userId)
    return this.getNewTokens(id, refreshToken.userAgent)
  }

  public async getNewTokens(id: string, userAgent: string) {
    const accessToken = this.jwtService.sign({ id })
    const refreshToken = await this.saveOrUpdateRefreshToken(id, userAgent)
    return { accessToken, refreshToken }
  }

  private async saveOrUpdateRefreshToken(userId: string, userAgent: string) {
    const existingToken = await this.tokenRepository.findOne({ where: { userId, userAgent } })

    if (existingToken) {
      await this.tokenRepository.delete({ userAgent, userId })
    }
    return await this.tokenRepository.save({
      token: v4(),
      expiresAt: add(new Date(), { months: 1 }),
      userId,
      userAgent,
    })
  }
}
