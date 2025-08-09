import { Router } from 'express';
import { createClass, deleteClass, getClass } from '../../controllers/class.controller';
export const classRouter = Router()

classRouter.get("/", getClass)
classRouter.post("/", createClass)
classRouter.delete("/:classId", deleteClass)