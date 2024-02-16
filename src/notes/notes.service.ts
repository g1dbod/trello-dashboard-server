import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import { User } from 'src/auth/types';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async createNote(user: any, dto: CreateNoteDto) {
    console.log({ user, dto });
  }
}
