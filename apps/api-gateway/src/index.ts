import express from "express"
import cors from "cors"
import proxy from "express-http-proxy"
import morgan from "morgan"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import cookieParser from 'cookie-parser';
import { NODE_ENV, PORT } from "./constant"
import { success } from "zod"

const app = express()

app.use(cors({
    origin: ["http://localhost:5173"],
    allowedHeaders: [
        "Authorization", "Contant-Type"
    ],
    credentials: true
}))

app.use(morgan("dev"))

app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ limit: "100mb", extended: true }))
app.use(cookieParser())
app.set("trust-proxy", 1)

// Apply rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req: any) => (req.user ? 1000 : 100),
    message: { error: "Too Many Requests, please try again later!" },
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: (req: any) => ipKeyGenerator(req.ip),
})

app.use(limiter)

app.get("/health-check", (req, res) => {
    console.log("Api Gateway is perfectly working")
    res.json({ success: true, message: "Api Gateway is perfectly working" })
})

app.use("/api/v1/auth", proxy("http://localhost:3001"))
app.use("/api/v1/admin", proxy("http://localhost:3002"))
app.use("/api/v1/teacher", proxy("http://localhost:3003"))
app.use("/api/v1/student", proxy("http://localhost:3004"))
app.use("/api/v1/user", proxy("http://localhost:3005"))

app.listen(PORT, () => {
    console.log(`API Gateway is running in ${NODE_ENV} environment at http://localhost:${PORT}`)
})
