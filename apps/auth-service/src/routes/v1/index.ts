import express from "express"
import { login, signup } from "../../controllers/auth.controller"
import { submitContact } from "../../controllers/contact.controller"

const router = express.Router()

router.get("/", (req, res) => { res.status(200).json({ message: "working" }) })
router.post("/login", login)
router.post("/contact", submitContact)
router.post("/signup", signup)

export { router }