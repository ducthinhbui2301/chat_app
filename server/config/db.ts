import { FindCursor, MongoClient } from "mongodb";
import { Option } from "@model/option_model";

const DB_NAME: string | undefined = process.env.DB_NAME;

export const FindMany = async (mongoClient: MongoClient, collection: string, query, option?: Option, sort?) => {
  try {
    let cursor: FindCursor
    if (option.skip != undefined && option.limit != undefined) {
      if (sort != undefined) {
        cursor = await mongoClient.db(DB_NAME).collection(collection).find(query).sort(sort).skip(option.skip).limit(option.limit);
      } else {
        cursor = await mongoClient.db(DB_NAME).collection(collection).find(query).skip(option.skip).limit(option.limit);
      }
    } else {
      cursor = await mongoClient.db(DB_NAME).collection(collection).find(query);
    }
    const result = await cursor.toArray();
    return result;
  } catch (error) {
    return error
  }
}

export const FindManyWithTotal = async (mongoClient: MongoClient, collection: string, query, option?: Option) => {
  try {
    const facet = [];
    const aggregate = [];

    // push stages in order
    aggregate.push({ "$match": query })

    // paginate request data
    if (option?.skip != null) facet.push({ "$skip": option.skip })
    if (option?.limit != null) facet.push({ "$limit": option.limit })

    aggregate.push({
      "$facet": {
        "data": facet,
        "total": [
          {
            "$count": 'count'
          }
        ]
      }
    })

    aggregate.push({ "$unwind": "$total" });
    aggregate.push({ "$set": { "total": "$total.count" } });
    const cursor = await mongoClient.db(DB_NAME).collection(collection).aggregate(aggregate);
    const result = await cursor.toArray();
    return result[0];
  } catch (error) {
    return error
  }
}

export const FindOne = async (mongoClient: MongoClient, collection: string, query, stages?) => {
  try {
    const aggregate = []
    if (query) {
      aggregate.push({ "$match": query })
    }
    if (stages) stages.forEach((stage) => {
      aggregate.push(stage)
    })
    const cursor = await mongoClient.db(DB_NAME).collection(collection).aggregate(aggregate)
    const result = await cursor.toArray()
    return result[0]
  } catch (error) {
    return error
  }
}

export const InsertOne = async (mongoClient: MongoClient, collection: string, data) => {
  try {
    const result = await mongoClient.db(DB_NAME).collection(collection).insertOne(data)
    return result
  } catch (error) {
    return error
  }
}

export const UpdateOne = async (mongoClient: MongoClient, collection: string, query, data, upsert?: boolean) => {
  try {
    const result = await mongoClient.db(DB_NAME).collection(collection).updateOne(query, data, {
      upsert: typeof upsert == 'boolean' ? upsert : true
    })
    return result
  } catch (error) {
    return error
  }
}

export const DeleteOne = async (mongoClient: MongoClient, collection: string, query) => {
  try {
    const result = await mongoClient.db(DB_NAME).collection(collection).deleteOne(query)
    return result
  } catch (error) {
    return error
  }
}
