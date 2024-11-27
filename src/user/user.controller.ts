import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get() // Define the GET route for fetching users
  async getUsers() {
    return await this.userService.getUsers(); // Call the service method to fetch users
  }
}
