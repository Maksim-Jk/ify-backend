import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities'
import { Repository } from 'typeorm'
import { genSaltSync, hashSync } from 'bcrypt'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  public async save(user: Partial<User>) {
    const hashPassword = this.hashPassword(user.password)

    try {
      return await this.userRepository.save({
        email: user.email,
        password: hashPassword,
      })
    } catch (e) {
      throw new BadRequestException('User already exists')
    }
  }

  public async findAll() {
    return await this.userRepository.find()
  }

  public async findByIdOrEmail(idOrEmail: string, seePassword: boolean = false) {
    const isEmail = idOrEmail.includes('@')
    const key = isEmail ? 'email' : 'id'

    const user = await this.userRepository.findOne({
      where: { [key]: idOrEmail },
      select: seePassword
        ? ['id', 'email', 'verified', 'password', 'createdAt', 'updatedAt']
        : ['id', 'email', 'verified', 'createdAt', 'updatedAt'],
    })

    if (!user) {
      throw new HttpException('User not found', 400)
    }

    return user
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10))
  }
}
