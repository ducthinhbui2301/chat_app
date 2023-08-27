import reactLogo from '@/assets/react.svg'
import { Button, FileInput, TextArea } from '@/components/index'
import { Formik, FormikProps } from 'formik';
import React, { useState, useRef, useEffect } from 'react';
import { InviteDialog, RoomChatBox } from '.';
import { RoomModel } from '@/models/room_model';
import { MessageModel } from '@/models/message_model';
import { useDispatch, useSelector } from 'react-redux';
import { AllReducer } from '@/redux/reducer';
import { UserModel } from '@/models/user_model';
import { MESSAGE_API, ROOM_API, SERVICE_URL } from '@/constants/api_constants';
import { SocketEmitter } from '@/constants/socket_emitters';
import { SocketEvent } from '@/constants/socket_events';
import { FileMetadata } from '@/models/socket_model';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/solid';
import { ALERT_ERROR, ALERT_INFO, ALERT_SUCCESS, HIDE_ALERT } from '@/redux/actions';
import { useNavigate } from 'react-router-dom';

interface InputModel {
  input?: string;
}

export function RoomChatPanel(
  { room, roomList, setRoomList }:
    {
      room: RoomModel | undefined,
      roomList: RoomModel[],
      setRoomList: (rooms: RoomModel[]) => void
    }
) {
  const navigator = useNavigate();
  const dispatch = useDispatch();
  const socket = useSelector((state: AllReducer) => state.socketState);
  const endSection = useRef<HTMLDivElement>(null);
  const authState = useSelector((state: AllReducer) => state.authState);
  const loginUser: UserModel | undefined = authState.user
  const [messageList, setMessageList] = React.useState<MessageModel[]>(room?.messageList ?? []);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const initialValues: InputModel = {
    input: ''
  }

  useEffect(() => {
    endSection.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageList])

  const sendMessage = async ({ input }: { input?: string }) => {
    try {
      if (loginUser?.id && room?.id && input) {
        const data: MessageModel = {
          content: input,
          senderId: loginUser.id,
          // readerList: [],
          // likeList: [],
          // heartList: [],
          createAt: (new Date).getTime(),
          // isRemoved: false,
          // replyToMessage: string,
          roomId: room?.id
        }
        const response = await fetch(`${SERVICE_URL}${MESSAGE_API}/create`,
          {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          });
        if (response.status == 201) {
          const responseData = await response.json();
          const newMessage = { id: responseData.id, ...data };
          setMessageList([newMessage, ...messageList]);
          socket.emit(SocketEmitter[SocketEmitter.SEND_MESSAGE], newMessage);
        } else {
          dispatch({
            type: ALERT_ERROR,
            data: "create room fail"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)
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
    }
  }

  const sendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const arrayBuffer: Uint8Array[] = [];

    if (!file) {
      return
    }
    const reader = new FileReader();
    reader.onload = function () {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      arrayBuffer.push(buffer);
    }
    reader.readAsArrayBuffer(file);

    // save file as new message to database
    try {
      if (loginUser?.id && room?.id) {
        const data: MessageModel = {
          file: arrayBuffer,
          fileName: file.name,
          senderId: loginUser.id,
          // readerList: [],
          // likeList: [],
          // heartList: [],
          createAt: (new Date).getTime(),
          // isRemoved: false,
          // replyToMessage: string,
          roomId: room?.id
        }
        const response = await fetch(`${SERVICE_URL}${MESSAGE_API}/create`,
          {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          });
        if (response.status == 201) {
          const responseData = await response.json();
          const newMessage = { id: responseData.id, ...data };
          setMessageList([newMessage, ...messageList]);
          for (let index = 0; index < arrayBuffer.length; index++) {
            // emit new file
            shareFile({
              filename: file.name,
              total_buffer_size: arrayBuffer[index].length,
              buffer_size: 1024
            }, arrayBuffer[index]);
          }
        } else {
          dispatch({
            type: ALERT_ERROR,
            data: "create message fail"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)
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
    }
  }

  const shareFile = (metatdata: FileMetadata, buffer: Uint8Array) => {
    const data = {
      roomId: room?.id,
      metadata: metatdata
    }
    socket.emit(SocketEmitter[SocketEmitter.SEND_FILE_METADATA], data);
    socket.on(SocketEvent[SocketEvent.FILE_TRANSFER], function () {
      const chunk: Uint8Array = buffer.slice(0, metatdata.buffer_size);
      buffer = buffer.slice(metatdata.buffer_size, buffer.length);
      if (chunk.length != 0) {
        socket.emit(SocketEmitter[SocketEmitter.SEND_FILE_BUFFER], {
          roomId: room?.id,
          buffer: chunk
        })
      }
    });
  }

  const deleteRoom = async () => {
    try {
      if (room?.id && room.adminID == loginUser?.id) {
        const response = await fetch(`${SERVICE_URL}${ROOM_API}/delete/${room?.id}`,
          {
            method: "DELETE",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            }
          });
        if (response.status == 200) {
          dispatch({
            type: ALERT_SUCCESS,
            data: "deleted room"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)
          setRoomList(roomList.filter((r) => r.id != room.id));
        } else {
          dispatch({
            type: ALERT_ERROR,
            data: "create room fail"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)
        }
      } else {
        dispatch({
          type: ALERT_INFO,
          data: "YOU don't own this room"
        });
        setTimeout(() => {
          dispatch({
            type: HIDE_ALERT
          });
        }, 2500)
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
    }
  }

  return (
    <div className="flex-grow flex flex-col">
      {/* Header */}
      <div className="flex flex-row items-center p-4 shadow-[0_4px_9px_-4px_#3b71ca] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)]">
        <div className='w-26 aspect-square rounded-full overflow-hidden'>
          <img src={reactLogo} className='object-contain w-full' />
        </div>
        <div className='ml-4 flex-grow'>{room?.name}</div>

        {room?.adminID == loginUser?.id &&
          <Button type='button' className='flex' onClick={deleteRoom}>
            <TrashIcon className='w-5 h-5 m-auto' />
          </Button>
        }
        <Button type='button' onClick={() => { }}>
          Members
        </Button>
        <Button type='button' onClick={() => setIsInviteDialogOpen(true)}>
          Invite
        </Button>
        <Button type='button' onClick={() => navigator(`/video-call/${room?.id}`)}>
          Video Call
        </Button>
        <InviteDialog room={room} openState={isInviteDialogOpen} setOpen={setIsInviteDialogOpen} />
      </div>

      {/* conversation */}
      <RoomChatBox room={room} messageList={messageList} setMessageList={setMessageList} endSection={endSection} />

      {/* input section */}
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: InputModel = {};
          if (!values.input) {
            errors.input = 'Required';
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setTimeout(async () => {
            await sendMessage(values)
            resetForm();
            setSubmitting(false);
          }, 400);
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }: FormikProps<InputModel>
        ) => (
          <form onSubmit={handleSubmit} className="flex flex-rpw w-full h-[80px] shadow-[0_4px_9px_4px_#3b71ca] dark:shadow-[0_4px_9px_4px_rgba(59,113,202,0.5)]">
            <FileInput disabled={isSubmitting} onChange={sendFile} />
            <TextArea
              id='reply-input'
              name="input"
              onChange={(e) => {
                handleChange(e);
                if ((e.target as HTMLTextAreaElement).value?.length > 0) {
                  socket.emit(SocketEmitter[SocketEmitter.TYPING], {
                    roomId: room?.id,
                    senderId: loginUser?.id
                  });
                } else {
                  socket.emit(SocketEmitter[SocketEmitter.STOP_TYPING], {
                    roomId: room?.id,
                  });
                }
              }}
              onBlur={handleBlur}
              value={values.input}
              className='w-full'
            />

            {/* Submit Button */}
            <Button type="submit" className='flex' disabled={isSubmitting}>
              <PaperAirplaneIcon className='w-8 h-8 m-auto' />
            </Button>
          </form>
        )}
      </Formik>
    </div>
  )
}