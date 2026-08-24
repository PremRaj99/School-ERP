import { Router } from 'express';
import {
  createStudentFee,
  deleteStudentFee,
  getStudentFeeDetail,
  getStudentFees,
  updateStudentFeeStatus,
} from '../controllers/studentFee.controller';

export const financeStudentFeeRouter = Router();

financeStudentFeeRouter.get('/', getStudentFees);
financeStudentFeeRouter.get('/:feeId', getStudentFeeDetail);
financeStudentFeeRouter.post('/', createStudentFee);
financeStudentFeeRouter.put('/:feeId/status', updateStudentFeeStatus);
financeStudentFeeRouter.delete('/:feeId', deleteStudentFee);
