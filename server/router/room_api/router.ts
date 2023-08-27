import express from "express";
import * as controller from './controller';
import { VerifyJwt } from "@handler";

export const RoomRouter = express.Router();

RoomRouter.get("/loadpotentialmembers/:id", VerifyJwt, controller.LoadPotentialMembers);
RoomRouter.get("/detail/:id", VerifyJwt, controller.LoadRoomDetail);
RoomRouter.post("/create", VerifyJwt, controller.CreateRoom);
RoomRouter.post("/update/:id", VerifyJwt, controller.UpdateRoom);
RoomRouter.delete("/delete/:id", VerifyJwt, controller.DeleteRoom);
RoomRouter.post("/removeuser/:id", VerifyJwt, controller.RemoveUserFromRoom);
