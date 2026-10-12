import { Router } from 'express';
import { getReportCard, getResult } from '../controllers/result.controller';

export const resultRouter = Router();

resultRouter.get('/:examId', getResult);

export const reportCardRouter = Router();

reportCardRouter.get('/:examId', getReportCard);
