import { Router } from "express"
import { academicRouter } from "./academic.route"
import { attendanceRouter } from "./attendance.route"
import { examRouter } from "./exam.route"
import { noticeRouter } from "./notice.route"
import { resultRouter } from "./result.route"
import { teacherRouter } from "./teacher.route"
import { transactionRouter } from "./transaction.router"

export const router = Router()


router.use("/attendance", attendanceRouter)

router.use("/exam", examRouter)

router.use("/result", resultRouter)

router.use("/academic", academicRouter)

router.use("/notice", noticeRouter)

router.use("/transaction", transactionRouter)

router.use("/", teacherRouter)