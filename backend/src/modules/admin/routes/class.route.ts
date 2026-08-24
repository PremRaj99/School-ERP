import { Router } from 'express';
import { createClass, deleteClass, getClasses, updateClass } from '../controllers/class.controller';

export const classRouter = Router();

classRouter.get('/', getClasses);
classRouter.post('/', createClass);
classRouter.put('/:classId', updateClass);
classRouter.delete('/:classId', deleteClass);
