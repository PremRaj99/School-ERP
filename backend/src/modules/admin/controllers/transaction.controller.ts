import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import {
  CreateTransactionSchema,
  ObjectIdSchema,
  txnCategorySchema,
  txnStatusSchema,
  UpdateTransactionSchema,
} from '../types';
import { AdminTransactionService } from '../services/transaction.service';

export const getTransactions = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters = {
      category: req.query.category
        ? validateSchema(txnCategorySchema, String(req.query.category))
        : undefined,
      status: req.query.status
        ? validateSchema(txnStatusSchema, String(req.query.status))
        : undefined,
    };

    const data = await AdminTransactionService.getTransactions(filters);
    res.status(200).json(new OkResponse(data));
  },
);

export const getTransactionDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const transactionId = validateSchema(ObjectIdSchema, String(req.params.transactionId));
    const data = await AdminTransactionService.getTransactionById(transactionId);
    res.status(200).json(new OkResponse(data));
  },
);

export const createTransaction = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreateTransactionSchema, req.body);
    await AdminTransactionService.createTransaction(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateTransaction = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const transactionId = validateSchema(ObjectIdSchema, String(req.params.transactionId));
    const parseData = validateSchema(UpdateTransactionSchema, req.body);
    await AdminTransactionService.updateTransaction(transactionId, parseData);
    res.status(202).json(new AcceptedResponse());
  },
);

export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const transactionId = validateSchema(ObjectIdSchema, String(req.params.transactionId));
    await AdminTransactionService.deleteTransaction(transactionId);
    res.status(202).json(new AcceptedResponse());
  },
);
