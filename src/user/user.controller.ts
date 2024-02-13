import { Controller, Get, Param } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetUserDto } from './dto'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get user by id or email' })
  @ApiResponse({ status: 200, type: GetUserDto })
  @Get('/:idOrEmail')
  findOne(@Param('idOrEmail') idOrEmail: string) {
    return this.userService.findByIdOrEmail(idOrEmail)
  }
}
