import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserService } from '../user/user.service'
import { RegisterDto } from './dto'
import { compareSync } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { Token, User } from '../user/entities'
import { v4 } from 'uuid'
import { add } from 'date-fns/add'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    return this.getNewTokens(user, userAgent)
  }

  public async refreshTokens(refreshToken: Token) {
    if (refreshToken.expiresAt < new Date()) {
      throw new BadRequestException('Refresh token expired')
    }

    const user = await this.userService.findByIdOrEmail(refreshToken.userId)
    return this.getNewTokens(user, refreshToken.userAgent)
  }

  private async getNewTokens(user: User, userAgent: string) {
    const accessToken = this.jwtService.sign({
      id: user.id,
    })
    const refreshToken = await this.saveOrUpdateRefreshToken(user.id, userAgent)
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
