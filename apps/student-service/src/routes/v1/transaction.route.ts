import {Router} from 'express'
import { getStudentFee, getStudentFeeDetail } from '../../controllers/transaction.controller';

export const transactionRouter = Router()

transactionRouter.get("/", getStudentFee);
transactionRouter.get("/:feeId", getStudentFeeDetail);
