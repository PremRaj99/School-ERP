import express from "express"
import { changePassword, getUser, logout, refresh } from "../../controllers/user.controller"

const router = express.Router()

router.get("/", getUser)
router.post("/change-password", changePassword)
router.post("/logout", logout)
router.get("/refresh", refresh)

export { router }