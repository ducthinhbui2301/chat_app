import express from "express";
import cors from "cors";
import { CorsOptions } from "@config";
import { RoomRouter, UserRouter, MessageRouter } from "@router";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

app.disable('x-powered-by');
app.use(cors(CorsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('tiny'));

app.use('/api/user', UserRouter);
app.use('/api/room', RoomRouter);
app.use('/api/message', MessageRouter);

export default app;