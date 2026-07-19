import { Router } from 'express';
import {
  createSubject,
  deleteSubject,
  getAllClassSubjects,
  getSubjects,
  updateSubject,
} from '../controllers/subject.controller';

export const subjectRouter = Router();

subjectRouter.get('/', getSubjects);
subjectRouter.get('/get-all-class-subject', getAllClassSubjects);
subjectRouter.put('/:subjectCode', updateSubject);
subjectRouter.post('/', createSubject);
subjectRouter.delete('/:subjectCode', deleteSubject);
