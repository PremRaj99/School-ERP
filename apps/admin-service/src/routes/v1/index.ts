import { Router } from "express"
import { teacherRouter } from "./teacher.route"
import { studentRouter } from "./student.route"
import { attendanceRouter } from "./attendance.route"
import { examRouter } from "./exam.route"
import { academicRouter } from "./academic.route"
import { noticeRouter } from "./notice.route"
import { classRouter } from "./class.route"
import { subjectRouter } from "./subject.route"

export const router = Router()

router.use("/teacher", teacherRouter)

router.use("/student", studentRouter)

router.use("/attendance", attendanceRouter)

router.use("/subject", subjectRouter)

router.use("/exam", examRouter)

router.use("/academic", academicRouter)

router.use("/notice", noticeRouter)

router.use("/class", classRouter)