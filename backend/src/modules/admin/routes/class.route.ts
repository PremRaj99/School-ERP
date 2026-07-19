import { Router } from 'express';
import { createClass, deleteClass, getClasses } from '../controllers/class.controller';

export const classRouter = Router();

classRouter.get("/", getClasses);
classRouter.post("/", createClass);
classRouter.delete("/:classId", deleteClass);
