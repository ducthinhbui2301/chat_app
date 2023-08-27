import { MessageModel } from "@/models/message_model";
import download from "downloadjs";

export function ReplyBox(
  { message }:
    { message: MessageModel }
) {
  return (
    <div
      className={"w-fit text-white p-4 my-2 ml-auto rounded-tl-xl rounded-tr-xl rounded-bl-xl".concat(
        message.file ? ' cursor-pointer border border-dashed border-[#0084ff]' : ' bg-[#0084ff]'
      )}
      onClick={() => {
        if (message.file) {
          download(new Blob(message.file), message.fileName);
        }
      }}
    >
      {message.content ?? message.fileName}
    </div>
  )
}