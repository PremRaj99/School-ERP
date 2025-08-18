import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN } from "./constant";
import { errorHandlerMiddleware } from '@repo/errorhandler';
import { router } from "./routes/v1";
import { verifyJWT } from "./middlewares/verifyJWT";

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

app.use(verifyJWT);
app.use("/", router)

app.use(errorHandlerMiddleware)


export { app }