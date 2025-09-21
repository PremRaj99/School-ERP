import express from "express"
import { changePassword, getUser, logout } from "../../controllers/user.controller"

const router = express.Router()

router.get("/", getUser)
router.post("/change-password", changePassword)
router.post("/logout", logout)

export { router }
