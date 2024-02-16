import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto';
import { Request } from 'express';

@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  CreateNote(@Body() dto: CreateNoteDto, @Req() req: Request) {
    const user = req.user;
    return this.notesService.createNote(user, dto);
  }
}
