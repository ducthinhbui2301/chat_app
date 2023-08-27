import { useState, useEffect } from "react";
import { MessageBox, ReplyBox, Typing } from ".";
import { MessageModel } from "@/models/message_model";
import { useDispatch, useSelector } from "react-redux";
import { AllReducer } from "@/redux/reducer";
import { MESSAGE_API, SERVICE_URL } from "@/constants/api_constants";
import { SocketEvent } from "@/constants/socket_events";
import { RoomModel } from "@/models/room_model";
import { FileMetadata } from "@/models/socket_model";
import { SocketEmitter } from "@/constants/socket_emitters";
import { ALERT_ERROR, HIDE_ALERT } from "@/redux/actions";

export function RoomChatBox(
  { room, messageList, setMessageList, endSection }:
    {
      room: RoomModel | undefined,
      messageList: MessageModel[],
      setMessageList: (messageList: MessageModel[]) => void,
      endSection: React.RefObject<HTMLDivElement>
    }
) {
  const dispatch = useDispatch();
  const socket = useSelector((state: AllReducer) => state.socketState);

  const [skip,] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const limit = 18;
  const authState = useSelector((state: AllReducer) => state.authState);
  const currentUser = authState.user;

  socket.on(SocketEvent[SocketEvent.RECEIVE_MESSAGE], (data: MessageModel) => {
    setMessageList([data, ...messageList])
    setTimeout(() => {
      endSection.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100);
  });

  let fileData: {
    metadata: FileMetadata,
    dataDownloaded: number,
    buffer: Uint8Array[]
  } | null

  socket.on(SocketEvent[SocketEvent.RECEIVE_FILE_METADATA], (metadata: FileMetadata) => {
    fileData = {
      metadata: metadata,
      dataDownloaded: 0,
      buffer: []
    }
    socket.emit(SocketEmitter[SocketEmitter.SEND_FILE_START], {
      roomId: room?.id
    })
  });

  socket.on(SocketEvent[SocketEvent.FILE_TRANSFER], (buffer: Uint8Array) => {
    if (fileData) {
      fileData.buffer.push(buffer);
      fileData.dataDownloaded += buffer.byteLength;
      if (fileData.dataDownloaded == fileData.metadata.total_buffer_size) {
        const newMessage: MessageModel = {
          fileName: fileData.metadata.filename,
          file: fileData.buffer,
        }
        setMessageList([newMessage, ...messageList])
        fileData = null
      } else {
        socket.emit(SocketEmitter[SocketEmitter.SEND_FILE_START], {
          roomId: room?.id
        })
      }
    }
  })

  useEffect(() => {
    endSection.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageList])

  useEffect(() => {
    if (skip > 0) {
      fetchMessages();
    }
  }, [skip, isFetching]);

  const fetchMessages = async () => {
    try {
      if (messageList.length == 0 || (skip == 0 || (skip > 0 && isFetching))) {
        const response = await fetch((`${SERVICE_URL}${MESSAGE_API}/load/${room?.id}?`.concat(encodeURI(JSON.stringify({
          skip: skip * limit,
          limit: limit
        })))),
          {
            method: "GET",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          });
        if (response.status == 200) {
          const data: MessageModel[] = await response.json();
          setMessageList(data);
        } else {
          alert("cannot fetch room list");
        }
      }
    } catch {
      dispatch({
        type: ALERT_ERROR,
        data: "error happened"
      });
      setTimeout(() => {
        dispatch({
          type: HIDE_ALERT
        });
      }, 2500)
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <div className='flex-grow flex flex-col w-full min-h-[300px] px-8 py-1 overflow-clip'>
      <div className='flex flex-col flex-grow overflow-y-auto no-scrollbar'>
        {
          messageList.slice(0).reverse()?.map((message: MessageModel, index: number) => (
            message.senderId == currentUser?.id ?
              <ReplyBox key={index} message={message} /> :
              <MessageBox key={index} room={room} message={message} />
          ))
        }
        <Typing />
        <div ref={endSection} />
      </div>
    </div>
  );
}