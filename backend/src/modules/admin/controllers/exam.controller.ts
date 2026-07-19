import { validateSchema } from "@/core/errors";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@/core/responses";
import { NextFunction, Request, Response } from 'express';
import { CreateExamSchema, ObjectIdSchema } from "../types";
import { AdminExamService } from "../services/exam.service";

export const getExams = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = await AdminExamService.getExams();
    res.status(200).json(new OkResponse(data));
});

export const createExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateExamSchema, req.body);
    await AdminExamService.createExam(parseData);
    res.status(201).json(new CreatedResponse());
});

export const deleteExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const examId = validateSchema(ObjectIdSchema, String(req.params.examId));
    await AdminExamService.deleteExam(examId);
    res.status(202).json(new AcceptedResponse());
});
