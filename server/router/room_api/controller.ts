import { IsValidJson, ParseOption } from "@handler";
import { FindOne, InsertOne, UpdateOne, DeleteOne, FindManyWithTotal } from "@config";
import { Request, Response } from "express";
import { RoomModel } from "@model/entity/room_model";
import { ObjectId } from "mongodb";
import { Option } from "@model/option_model";
import { DefaultMessagePagination } from "@constant";
const collection = 'room';

export const LoadRoomDetail = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    let data = await FindOne(
      req.app.locals.db,
      collection,
      { _id: id },
      [
        {
          "$lookup": {
            "from": "user",
            "localField": "_id",
            "foreignField": "roomList",
            "as": "userList"
          }
        },
        {
          "$lookup": {
            "from": "message",
            "let": {
              "roomId": "$_id"
            },
            "pipeline": [
              {
                "$match": { "$expr": { "$eq": ["$roomId", "$$roomId"] } }
              }, {
                "$sort": { "_id": -1 }
              }, {
                "$limit": DefaultMessagePagination.limit
              }
            ],
            "as": "messageList"
          }
        }
      ]
    )
    if (data) {
      data = {
        ...data,
        id: data._id,
        _id: undefined,
        messageList: data.messageList?.map((m) => ({ ...m, id: m?._id, _id: undefined })),
        userList: data.userList?.map((u) => ({ ...u, id: u?._id, _id: undefined })),
      };
    }
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const LoadPotentialMembers = async (req: Request, res: Response) => {
  try {
    let option: Option = {};
    if (req.query.option) option = ParseOption(req);
    const id = new ObjectId(req.params.id);

    const data = await FindManyWithTotal(
      req.app.locals.db,
      "user",
      { roomList: { "$ne": id } },
      option,
    )
    data.data = data.data?.map((r) => ({ ...r, id: r._id, _id: undefined }));
    return res.status(200).send({
      data: data.data ?? [],
      total: data.total ?? 0
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const CreateRoom = async (req: Request, res: Response) => {
  try {
    const payload: RoomModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    const adminID = new ObjectId(payload.adminID);
    if (payload.name && adminID) {
      const room = await FindOne(
        req.app.locals.db,
        collection,
        { "name": payload.name },
        null
      );
      if (room) {
        return res.status(409).send({ message: 'Room Name Existed' });
      }

      const data: RoomModel = {
        name: payload.name,
        adminID: adminID
      }
      const result = await InsertOne(req.app.locals.db, collection, data);
      await UpdateOne(req.app.locals.db, "user", { _id: adminID }, { "$push": { "roomList": result.insertedId } }, false);

      return res.status(201).send({
        id: result.insertedId
      });

    } else {
      return res.status(400).send({ message: 'Invalid Room Information' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const UpdateRoom = async (req: Request, res: Response) => {
  try {
    const payload: RoomModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    const id = new ObjectId(req.params.id);
    if (payload.name) {
      const user = await FindOne(
        req.app.locals.db,
        collection,
        { _id: id },
        null
      );
      if (user) {
        return res.status(409).send({ message: 'Room Name Existed' });
      }
      const data = {
        "$set": {
          name: payload.name,
        }
      }
      const result = await UpdateOne(req.app.locals.db, collection, { _id: id }, data, false)
      return res.status(200).send();
    } else {
      return res.status(400).send({ message: 'Invalid Room Information' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const DeleteRoom = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    await Promise.all([
      DeleteOne(
        req.app.locals.db,
        collection,
        { _id: id }
      ),
      //update user roomList and invitationList
    ])
    return res.status(200).send();
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const RemoveUserFromRoom = async (req: Request, res: Response) => {
  try {
    const payload: { userID: string } = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    const id = new ObjectId(req.params.id);
    if (payload.userID) {
      const data = {
        "$pull": {
          userList: new ObjectId(payload.userID)
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

