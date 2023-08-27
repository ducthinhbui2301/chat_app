import express from "express";
import * as controller from './controller';
import { VerifyJwt } from "@handler";

export const UserRouter = express.Router();

UserRouter.post("/signin", controller.SignIn);
UserRouter.post("/signup", controller.SignUp);
UserRouter.get("/loadfriends/:id", VerifyJwt, controller.LoadFriends);
UserRouter.get("/loadrooms/:id", VerifyJwt, controller.LoadRooms);
UserRouter.get("/loadinvitations/:id", VerifyJwt, controller.LoadInvitationList);
UserRouter.post("/acceptinvitation/:id", VerifyJwt, controller.AcceptInvitationList);
UserRouter.post("/declineinvitation/:id", VerifyJwt, controller.DeclineInvitationList);
UserRouter.post("/inviteuser/:id", VerifyJwt, controller.InviteUser);