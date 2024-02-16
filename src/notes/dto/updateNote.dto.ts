import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
