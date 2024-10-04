import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNoteInput } from './dto/create-note.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createNoteInput: CreateNoteInput): Promise<Note[]> {
    const { note: notesArray, studentId, createdBy } = createNoteInput;

    if (!studentId) {
      throw new BadRequestException('StudentId is required');
    }
    if (!notesArray || notesArray.length === 0) {
      throw new BadRequestException('At least one note is required');
    }
    if (!createdBy || createdBy.length === 0) {
      throw new BadRequestException('At least one createdBy ID is required');
    }
    const student = await this.userRepository.findOneBy({ user_id: studentId });
    if (!student) {
      throw new BadRequestException('Student not found');
    }
    const users = await this.userRepository.find({
      where: { user_id: In(createdBy) },
    });

    if (!users.length) {
      throw new BadRequestException('Users not found');
    }

    const existingNotes = await this.noteRepository.find({
      where: { user: student },
      relations: ['createdBy'],
    });

    const newNotesToSave: Note[] = [];
    const notesToCreate = [];

    for (let i = 0; i < notesArray.length; i++) {
      const noteText = notesArray[i];
      const userId = createdBy[i];

      const user = users.find((u) => u.user_id === userId);
      if (!user) {
        throw new BadRequestException(`User not found for ID: ${userId}`);
      }

      const existingNote = existingNotes.find(
        (n) => n.note === noteText && n.createdBy.user_id === userId,
      );

      if (!existingNote) {
        const newNote = this.noteRepository.create({
          note: noteText,
          user: student,
          createdBy: user,
        });
        notesToCreate.push(newNote);
      }
    }

    if (notesToCreate.length > 0) {
      const savedNotes = await this.noteRepository.save(notesToCreate);
      newNotesToSave.push(...savedNotes);
    }

    const notesToDelete = existingNotes.filter(
      (existingNote) =>
        !notesArray.includes(existingNote.note) ||
        !createdBy.includes(existingNote.createdBy.user_id),
    );

    if (notesToDelete.length > 0) {
      await this.noteRepository.remove(notesToDelete);
    }

    return newNotesToSave;
  }

  async findAll(userId: string): Promise<Note[]> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const notes = await this.noteRepository.find({
      where: { user: { user_id: userId } },
      relations: ['user', 'createdBy'],
    });

    return notes;
  }
  async remove(noteId: string): Promise<{ note_id: string }> {
    if (!noteId) {
      throw new BadRequestException('NoteId is required');
    }
    const note = await this.noteRepository.findOneBy({ note_id: noteId });
    if (!note) {
      throw new BadRequestException('Note not found');
    }

    await this.noteRepository.remove(note);
    return { note_id: noteId };
  }
}
