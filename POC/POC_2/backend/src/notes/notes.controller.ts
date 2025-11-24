import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from './note.entity';

@Controller('api/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: { title: string; content: string }): Promise<Note> {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  findAll(): Promise<Note[]> {
    return this.notesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Note> {
    const note = await this.notesService.findOne(+id);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateNoteDto: { title?: string; content?: string }): Promise<Note> {
    const note = await this.notesService.update(+id, updateNoteDto);
    if (!note) {
        throw new NotFoundException('Note not found');
    }
    return note;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.notesService.remove(+id);
  }
}
