import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ResUser, Tokens, UpdateUser, jwtUser } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async SignUp(dto: SignUpDto): Promise<ResUser> {
    const candidate = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (candidate) throw new BadRequestException('Такой пользователь уже есть');

    const hash = await this.hashData(dto.password);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRt, ...newUser } = await this.prisma.user.create({
      data: {
        ...dto,
        password: hash,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    return { ...tokens, user: newUser };
  }

  async SignIn(dto: SignInDto): Promise<ResUser> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRt, ...user } = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Ошибка авторизации');

    const passwordMatches = await bcrypt.compare(dto.password, password);
    if (!passwordMatches) throw new ForbiddenException('Ошибка авторизации');

    const tokens = await this.getTokens(user.id, user);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return { ...tokens, user };
  }

  async Logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
  }

  async Auth(userId: string): Promise<{ user: jwtUser }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRt, ...user } = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ForbiddenException('Ошибка авторизации');

    return { user };
  }

  async UpdateUser(
    userId: string,
    editUser: UpdateUser,
  ): Promise<{ user: jwtUser }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRt, ...user } = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...editUser,
      },
    });
    if (!user) throw new ForbiddenException('Ошибка авторизации');

    return { user };
  }

  async Refresh(userId: string, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ForbiddenException('Ошибка авторизации');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Ошибка авторизации');

    const tokens = await this.getTokens(user.id, user);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await this.hashData(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 8);
  }

  async getTokens(userId: string, user: jwtUser) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          ...user,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          ...user,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
