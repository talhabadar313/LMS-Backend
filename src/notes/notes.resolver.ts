import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteInput } from './dto/create-note.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { AddNoteInput } from './dto/add-note-input';

@Resolver(() => Note)
export class NotesResolver {
  constructor(private readonly notesService: NotesService) {}

  @Mutation(() => [Note], { name: 'addNoteToStudent' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  createNote(
    @Args('createNoteInput') createNoteInput: CreateNoteInput,
  ): Promise<Note[]> {
    return this.notesService.create(createNoteInput);
  }

  @Mutation(() => [Note], { name: 'addNote' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  addNote(@Args('addNoteInput') addNoteInput: AddNoteInput): Promise<Note[]> {
    return this.notesService.add(addNoteInput);
  }

  @Query(() => [Note], { name: 'getStudentNotes' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findAll(@Args('userId', { type: () => String }) userId: string) {
    return this.notesService.findAll(userId);
  }

  @Mutation(() => Note, { name: 'removeNoteFromStudent' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  removeNote(@Args('noteId', { type: () => String }) noteId: string) {
    return this.notesService.remove(noteId);
  }
}
