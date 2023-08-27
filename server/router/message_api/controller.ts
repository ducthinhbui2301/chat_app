import { IsValidJson, ParseOption } from "@handler";
import { FindMany, InsertOne, DeleteOne } from "@config";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { Option } from "@model/option_model";
import { MessageModel } from "@model/entity/message_model";
import { DefaultMessagePagination } from "@constant";
const collection = 'message';

export const LoadMessages = async (req: Request, res: Response) => {
  try {
    let option: Option = DefaultMessagePagination;
    const roomId = new ObjectId(req.params.roomId);
    if (req.query.option) option = ParseOption(req) ?? DefaultMessagePagination;
    let data = await FindMany(
      req.app.locals.db,
      collection,
      { roomId },
      option,
      { _id: -1 }
    )
    data = data?.map((m) => ({ ...m, id: m._id, _id: undefined }));
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const CreateMessage = async (req: Request, res: Response) => {
  try {
    const payload: MessageModel = IsValidJson(req.body) ? JSON.parse(req.body) : req.body;
    if ((payload.content || payload.file) && payload.senderId && payload.roomId) {

      payload.readerList = payload.readerList?.map((m) => new ObjectId(m));
      payload.likeList = payload.likeList?.map((m) => new ObjectId(m));
      payload.heartList = payload.heartList?.map((m) => new ObjectId(m));
      payload.senderId = new ObjectId(payload.senderId);
      payload.roomId = new ObjectId(payload.roomId);
      if (payload.replyToMessage) {
        payload.replyToMessage = new ObjectId(payload.replyToMessage);
      }

      const result = await InsertOne(req.app.locals.db, collection, payload);

      return res.status(201).send({
        id: result.insertedId
      });

    } else {
      return res.status(400).send({ message: 'Invalid Message Information' });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

export const DeleteMessage = async (req: Request, res: Response) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = DeleteOne(
      req.app.locals.db,
      collection,
      { _id: id }
    )
    return res.status(200).send();
  } catch (error) {
    return res.status(500).send(error);
  }
}


