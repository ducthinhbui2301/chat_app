import { MessageModel } from "@/models/message_model";
import { RoomModel } from "@/models/room_model";
import download from "downloadjs";

export function MessageBox(
  { room, message }:
    {
      room: RoomModel | undefined,
      message: MessageModel
    }
) {
  let user = room?.userList?.find((u) => typeof u != "string" ? u.id == message.senderId : u);
  if (typeof user != "object") {
    user = undefined;
  }

  return (
    <div className={"flex flex-row gap-1.5 items-center mr-auto rounded-tl-xl rounded-tr-xl rounded-br-xl p-2 my-2".concat(
      message.file ? ' cursor-pointer border border-dashed border-[#3e4042]' : ' bg-[#3e4042]'
    )}>
      <p>{user?.name}</p>

      <div className="w-1 h-full rounded-md bg-[#242424]" />

      <div className="w-fit text-violet-200 rounded-md p-4"
        onClick={() => {
          if (message.file) {
            download(new Blob(message.file), message.fileName);
          }
        }}>
        {message.content ?? message.fileName}
      </div>
    </div>
  )
}