import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { generateSubjectCode, getGroupedSubject } from "@repo/helper";
import { CreateSubjectSchema, subjectCodeSchema, UpdateSubjectSchema } from "@repo/types";


export const getAllClassSubjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = await getGroupedSubject()

    res.status(200).json(new OkResponse(data))

})

export const createSubject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(CreateSubjectSchema, req.body)

    const subjectCode = generateSubjectCode(parseData.subjectName)

    const now = new Date()
    const yearFrom = now.getFullYear()
    const session = `${yearFrom}-${yearFrom + 1}`

    const className = await prisma.class.findFirst({
        where: { className: parseData.className, session }
    })

    if (!className) {
        throw new NotFoundError()
    }

    await prisma.subject.create({
        data: {
            subjectCode,
            subjectName: parseData.subjectName,
        }
    })

    res.status(201).json(new CreatedResponse())
})

export const updateSubject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const subjectCode = validateSchema(subjectCodeSchema, req.params.subjectCode);

    const parseData = validateSchema(UpdateSubjectSchema, req.body)
    const newSubjectCode = generateSubjectCode(parseData.subjectName);

    const subject = await prisma.subject.update({
        where: { subjectCode },
        data: {
            subjectName: parseData.subjectName,
            subjectCode: newSubjectCode
        }
    })
    if (!subject) {
        throw new NotFoundError()
    }

    res.status(202).json(new AcceptedResponse())

})

export const deleteSubject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const subjectCode = validateSchema(subjectCodeSchema, req.params.subjectCode);

    const subject = await prisma.subject.delete({
        where: { subjectCode }
    })

    if (!subject) {
        throw new NotFoundError()
    }

    res.status(202).json(new AcceptedResponse())
})
