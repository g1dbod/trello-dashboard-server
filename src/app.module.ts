import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './commom/guards';
import { NotesModule } from './notes/notes.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [AuthModule, PrismaModule, NotesModule, TodosModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
