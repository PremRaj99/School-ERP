import { errorHandlerMiddleware } from '@repo/errorhandler';
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { CORS_ORIGIN } from "./constant";
import { router } from "./routes/v1";
import { verifyJWT } from './middlewares/verifyJWT';
import { TeacherOnly } from './middlewares/verifyTeacher';

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(verifyJWT, TeacherOnly)

app.use("/", router)

app.use(errorHandlerMiddleware)


export { app };
