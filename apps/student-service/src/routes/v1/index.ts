import { Router } from "express"
import { academicRouter } from "./academic.route"
import { attendanceRouter } from "./attendance.route"
import { examRouter } from "./exam.route"
import { noticeRouter } from "./notice.route"
import { studentRouter } from "./student.route"
import { subjectRouter } from "./subject.route"
import { transactionRouter } from "./transaction.route"

export const router = Router()


router.use("/attendance", attendanceRouter)

router.use("/transaction", transactionRouter)

router.use("/subject", subjectRouter)

router.use("/exam", examRouter)

router.use("/academic", academicRouter)

router.use("/notice", noticeRouter)

router.use("/", studentRouter)