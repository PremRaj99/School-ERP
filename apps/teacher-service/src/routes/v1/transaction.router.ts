import { Router } from 'express';
import { getTeacherSalary } from '../../controllers/transaction.controller';

export const transactionRouter = Router()

transactionRouter.get("/", getTeacherSalary)