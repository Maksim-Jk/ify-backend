import { Controller, Get, Param } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  find() {
    return this.userService.findAll()
  }

  @Get('/:idOrEmail')
  findOne(@Param('idOrEmail') idOrEmail: string) {
    return this.userService.findByIdOrEmail(idOrEmail)
  }
}
