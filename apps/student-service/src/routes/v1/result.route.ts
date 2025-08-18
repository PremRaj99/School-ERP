import { Router} from "express"
import { getResult } from "../../controllers/result.controller"

export const resultRouter = Router()

resultRouter.get("/:examId", getResult)