import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { ResUser, Tokens, jwtUser } from './types';
import { Request } from 'express';
import { RtGuard } from 'src/commom/guards';
import { Public } from 'src/commom/decorators';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  SignUp(@Body() dto: SignUpDto): Promise<ResUser> {
    return this.authService.SignUp(dto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  SignIn(@Body() dto: SignInDto): Promise<ResUser> {
    return this.authService.SignIn(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  Logout(@Req() req: Request) {
    const user = req.user;
    return this.authService.Logout(user['sub']);
  }

  @Get('auth')
  @HttpCode(HttpStatus.OK)
  Auth(@Req() req: Request): Promise<{ user: jwtUser }> {
    const user = req.user;
    return this.authService.Auth(user['sub']);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  Refresh(@Req() req: Request): Promise<Tokens> {
    const user = req.user;
    return this.authService.Refresh(user['sub'], user['refreshToken']);
  }
}
