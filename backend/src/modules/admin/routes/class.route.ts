import { Router } from 'express';
import {
  createClass,
  deleteClass,
  getClasses,
  getClassSubjects,
  setClassSubjects,
  updateClass,
} from '../controllers/class.controller';

export const classRouter = Router();

classRouter.get('/', getClasses);
classRouter.post('/', createClass);
classRouter.put('/:classId', updateClass);
classRouter.delete('/:classId', deleteClass);
classRouter.get('/:classId/subjects', getClassSubjects);
classRouter.put('/:classId/subjects', setClassSubjects);
