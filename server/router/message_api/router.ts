import express from "express";
import * as controller from './controller';
import { VerifyJwt } from "@handler";

export const MessageRouter = express.Router();

MessageRouter.get("/load/:roomId", VerifyJwt, controller.LoadMessages);
MessageRouter.post("/create", VerifyJwt, controller.CreateMessage);
MessageRouter.delete("/delete/:id", VerifyJwt, controller.DeleteMessage);
