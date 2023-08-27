import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { sign, verify } from "jsonwebtoken";

const privateKey = fs.readFileSync('private_key.pem', "ascii");
const publicKey = fs.readFileSync('public_key.pem', "ascii");

export const SignJwt = (res: Response, payload: { id: string }) => {
  try {
    // const key = { payload };
    return sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1 hour'
    })
  } catch (error) {

    return res.status(500).send(error)
  }
}

export const VerifyJwt = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).send({ message: 'No token provided' })
    }
    verify(token, publicKey, (error: Error) => {
      if (error) {
        return res.status(401).send({ message: 'Unauthorized or timeout' })
      }
      // req["user"] = decoded.user
      next()
    })
  } catch (error) {
    res.status(500).send(error)
  }
}