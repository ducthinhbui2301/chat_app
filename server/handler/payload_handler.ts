import { Request } from "express";
import { Option } from "@model/option_model";

export const IsValidJson = (json) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
}
export const ParseOption = (req: Request): Option | null => {
  try {
    const optionString = req.query.option;
    if (typeof optionString == "string") {
      return IsValidJson(decodeURI(optionString)) ? JSON.parse(decodeURI(optionString)) : {};
    }
  } catch (e) {
    return;
  }
  return;
}