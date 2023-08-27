import { IsValidJson, ParseOption, SignJwt } from "@handler";
import { FindManyWithTotal, FindOne, InsertOne, UpdateOne } from "@config";
import * as bcrypt from "bcrypt";
import { Option } from "@model/option_model";
import { Request, Response } from "express";
import { UserModel } from "@model/entity/user_model";
import { LoginModel } from "@model/entity/login_model";
import { ObjectId } from "mongodb";
const collection = 'user';

export const SignIn = async (req: Request, res: Response) => {
  try {
    const payload: LoginModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    if (payload.email && payload.password) {
      let user = await FindOne(
        req.app.locals.db,
        collection,
        { "email": payload.email },
        [
          {
            "$lookup": {
              "from": "room",
              "localField": "roomList",
              "foreignField": "_id",
              "as": "roomList"
            }
          }
        ]
      );
      if (!user) {
        return res.status(401).send({ message: 'Not Found Email' });
      }
      user = {
        ...user,
        id: user._id,
        _id: undefined,
        roomList: user.roomList?.map((r) => ({ ...r, id: r?._id, _id: undefined })),
      };

      bcrypt.compare(payload.password, user.password, async (error, compareResult) => {
        if (error) {
          return res.status(500).send(error);
        }
        else if (compareResult) {
          const token = SignJwt(res, { id: user.id });
          res.cookie('token', token, {
            maxAge: 60 * 60 * 1000, //1 hour
            secure: true,
            httpOnly: true,
            sameSite: "none"
          });
          return res.status(200).send(
            {
              user: {
                id: user.id,
                name: user.name,
                roomList: user.roomList,
              },
              validDuration: 60
            });
        } else {
          return res.status(401).send({ message: 'Incorrect Password' });
        }
      });
    } else {
      return res.status(400).send({ message: 'Invalid Email Or Password' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const SignUp = async (req: Request, res: Response) => {
  try {
    const payload: UserModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    const user = await FindOne(
      req.app.locals.db,
      collection,
      { "email": payload.email },
      null
    );
    if (user) {
      return res.status(409).send({ message: 'User Existed' });
    }

    const data: UserModel = {
      name: payload.name,
      email: payload.email,
      password: payload.password
    }
    if (payload.password) data.password = await bcrypt.hash(payload.password, 10);

    await InsertOne(req.app.locals.db, collection, data)

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const LoadFriends = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    let option: Option = {};
    if (req.query.option) option = ParseOption(req);
    const data = FindManyWithTotal(
      req.app.locals.db,
      collection,
      { _id: { "$ne": id } },
      option
    )
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const LoadRooms = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    const data = await FindOne(
      req.app.locals.db,
      collection,
      { _id: id },
      [
        {
          "$project": {
            "roomList": 1
          }
        },
        {
          "$lookup": {
            "from": "room",
            "localField": "roomList",
            "foreignField": "_id",
            "as": "roomList"
          }
        }
      ]
    )
    if (data?.roomList) {
      data.roomList = data.roomList?.map((r) => ({ ...r, id: r._id, _id: undefined }));
    }
    return res.status(200).send(data.roomList);
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const LoadInvitationList = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    const data = await FindOne(
      req.app.locals.db,
      collection,
      { _id: id },
      [
        {
          "$project": {
            "roomInvitedList": 1
          }
        },
        {
          "$lookup": {
            "from": "room",
            "localField": "roomInvitedList",
            "foreignField": "_id",
            "as": "roomInvitedList"
          }
        }
      ]
    )
    return res.status(200).send(data?.roomInvitedList?.map((i) => ({ ...i, id: i._id, _id: undefined })));
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const AcceptInvitationList = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    const payload: UserModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    if (Array.isArray(payload.roomInvitedList) && payload.roomInvitedList?.length > 0) {
      const user: UserModel = await FindOne(
        req.app.locals.db,
        collection,
        { _id: id }
      );
      if (!user) {
        return res.status(401).send({ message: 'Not Found User' });
      }

      await UpdateOne(
        req.app.locals.db,
        collection,
        { _id: id },
        {
          "$set": {
            "roomList": [...(user.roomList ?? []), ...payload.roomInvitedList.map((r) => new ObjectId(r))],
            "roomInvitedList": (user.roomInvitedList as ObjectId[]).filter((i) => !payload.roomInvitedList.some((ir) => ir?.toString() == i?.toString()))
          }
        }
      );
      return res.status(200).send();
    } else {
      return res.status(400).send({ message: 'Invalid Invitation Information' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}
export const DeclineInvitationList = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    const payload: UserModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    if (Array.isArray(payload.roomInvitedList) && payload.roomInvitedList?.length > 0) {

      await UpdateOne(
        req.app.locals.db,
        collection,
        { _id: id },
        {
          "$pull": {
            "roomInvitedList": { "$in": payload.roomInvitedList.map((i) => new ObjectId(i)) }
          }
        }
      );
      return res.status(200).send();
    } else {
      return res.status(400).send({ message: 'Invalid Invitation Information' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const InviteUser = async (req: Request, res: Response) => {
  try {
    const payload: UserModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    const id = new ObjectId(req.params.id);
    if (payload.id) {
      const data = {
        "$push": {
          roomInvitedList: new ObjectId(payload.id)
        }
      }
      const result = UpdateOne(req.app.locals.db, collection, { _id: id }, data, false)
      return res.status(200).send();
    } else {
      return res.status(400).send({ message: 'Invalid User ID' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}
