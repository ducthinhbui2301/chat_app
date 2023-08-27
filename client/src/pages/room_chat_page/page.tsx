import { useState, useEffect } from "react";
import { RoomChatPanel, RoomItem, RoomFormDialog } from ".";
import { Button } from "@/components/button";
import { RoomModel } from "@/models/room_model";
import { ROOM_API, SERVICE_URL, USER_API } from "@/constants/api_constants";
import { useDispatch, useSelector } from "react-redux";
import { AllReducer } from "@/redux/reducer";
import { UserModel } from "@/models/user_model";
import { VerticalDivider } from "@/components/vertical_divider";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ALERT_ERROR, HIDE_ALERT } from "@/redux/actions";

export function RoomChatPage() {
  const dispatch = useDispatch();
  const loginUser: UserModel | undefined = useSelector((state: AllReducer) => state.authState)?.user;
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomModel | undefined>(undefined);

  const [roomList, setRoomList] = useState<RoomModel[]>([]);
  useEffect(() => {
    fetchRoomDetail();
  }, [currentRoom?.id]);

  useEffect(() => {
    fetchRooms();
  }, [])

  const fetchRooms = async () => {
    try {
      if (loginUser?.id) {
        const response = await fetch((`${SERVICE_URL}${USER_API}/loadrooms/${loginUser?.id}`),
          {
            method: "GET",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          });
        if (response.status == 200) {
          const data: RoomModel[] = await response.json();
          setRoomList(data);
        } else {
          dispatch({
            type: ALERT_ERROR,
            data: "cannot fetch room list"
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

  const appendRoomList = (newRoom: RoomModel) => {
    setRoomList([newRoom, ...roomList]);
  }

  const fetchRoomDetail = async () => {
    try {
      if (currentRoom?.id) {
        const response = await fetch(`${SERVICE_URL}${ROOM_API}/detail/${currentRoom?.id}`,
          {
            method: "GET",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            }
          });
        if (response.status == 200) {
          const responseData = await response.json();
          setCurrentRoom(responseData);
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

  return (
    <div className="h-screen w-full flex flex-row border-4 border-blue-600 rounded-md">
      {/* group chat list section */}
      <div className="flex flex-col overflow-y-auto max-w-[300px]">
        <p className="text-3xl text-center p-4">Your Room List</p>
        {
          roomList.map((item, index) => (
            <RoomItem
              key={index}
              label={item.name ?? "Unknown"}
              onClick={() => {
                currentRoom?.id != undefined && item.id == currentRoom?.id ? setCurrentRoom(undefined) : setCurrentRoom({ id: item.id })
              }}
              isDisplayed={currentRoom?.id != undefined && currentRoom?.id == item.id}
            />
          ))

        }
        <Button
          type="button"
          className="flex flex-row items-center justify-center text-red-600"
          onClick={() => setIsCreateRoomDialogOpen(!isCreateRoomDialogOpen)}
        >
          <PlusIcon className="w-8 h-8 mr-4 text-red-600" />
          <span className="text-red-600">New Room</span>
        </Button>
        <RoomFormDialog
          openState={isCreateRoomDialogOpen}
          setOpen={setIsCreateRoomDialogOpen}
          loginUser={loginUser}
          appendRoomList={appendRoomList}
        />
      </div>

      <VerticalDivider />
      {/* group chat panel */}
      {currentRoom?.id && currentRoom.name &&
        <RoomChatPanel room={currentRoom} roomList={roomList} setRoomList={setRoomList} />
      }
    </div>
  )
}
