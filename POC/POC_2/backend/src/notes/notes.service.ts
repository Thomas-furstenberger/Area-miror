import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) {}

  findAll(): Promise<Note[]> {
    return this.notesRepository.find();
  }

  findOne(id: number): Promise<Note | null> {
    return this.notesRepository.findOneBy({ id });
  }

  create(note: Partial<Note>): Promise<Note> {
    const newNote = this.notesRepository.create(note);
    return this.notesRepository.save(newNote);
  }

  async update(id: number, note: Partial<Note>): Promise<Note | null> {
    const result = await this.notesRepository.update(id, note);
    if (result.affected === 0) {
        return null;
    }
    return this.notesRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.notesRepository.delete(id);
  }
}
