import { useState, useEffect } from "react";
import { FormDialog } from "@/components/form";
import { UserModel } from "@/models/user_model";
import { ROOM_API, SERVICE_URL, USER_API } from "@/constants/api_constants";
import { RoomModel } from "@/models/room_model";
import { InfiniteScroll } from "@/components/infinite_scroll";
import { Button } from "@/components/button";
import { useDispatch, useSelector } from "react-redux";
import { AllReducer } from "@/redux/reducer";
import { SocketEmitter } from "@/constants/socket_emitters";
import { NewRoomEventData } from "@/models/socket_model";
import { ALERT_ERROR, ALERT_SUCCESS, HIDE_ALERT } from "@/redux/actions";
import { PlusIcon } from "@heroicons/react/24/solid";

export function InviteDialog(
  { openState, setOpen, room }:
    {
      openState: boolean,
      setOpen: (open: boolean) => void,
      room: RoomModel | undefined,
    }
) {
  const socket = useSelector((state: AllReducer) => state.socketState);
  const dispatch = useDispatch();
  const [friendList, setFriendList] = useState<UserModel[]>([]);
  const [friendTotalNumber, setFriendTotalNumber] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 5;
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchFriendList();
  }, []);

  const fetchFriendList = async () => {
    try {
      if (friendList.length == 0 || friendTotalNumber > friendList.length || (skip == 0 || (skip > 0 && isFetching))) {
        const response = await fetch((`${SERVICE_URL}${ROOM_API}/loadpotentialmembers/${room?.id}?`.concat(encodeURI(JSON.stringify({
          skip: skip * limit,
          limit: limit
        })))),
          {
            method: "GET",
            credentials: 'include',
          });

        const responseData = await response.json();
        setFriendList(responseData.data ?? []);
        setFriendTotalNumber(responseData.total ?? 0);
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

  const invite = async (user: UserModel) => {
    try {
      if (user?.id) {
        const response = await fetch(`${SERVICE_URL}${USER_API}/inviteuser/${user.id}`,
          {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: room?.id
            })
          });
        if (response.status == 200) {
          const socketData: NewRoomEventData = {
            roomId: room?.id,
            roomName: room?.name,
            userId: user.id,
            userName: user.name
          }
          socket.emit(SocketEmitter[SocketEmitter.INVITE_USER], socketData);
          dispatch({
            type: ALERT_SUCCESS,
            data: "invite user to room successfully"
          });
          setTimeout(() => {
            dispatch({
              type: HIDE_ALERT
            });
          }, 2500)
          // appendRoomList({ id: responseData.id, ...data });
        } else {
          dispatch({
            type: ALERT_ERROR,
            data: "invite user to room fail"
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
    <FormDialog
      openState={openState}
      setOpen={setOpen}
      title={"Invite A Friend To Your Room"}
    >
      <div className="p-2">
        {friendList?.length > 0 ?
          <InfiniteScroll
            isFetching={isFetching}
            isIndicatorDisplayed={friendTotalNumber > friendList.length}
            setFetching={() => setIsFetching(true)}
            increaseSkip={() => setSkip(skip + 1)}
          >
            {friendList.map((friend, index) => (
              <Button key={index} type="button" className="flex flex-row items-center justify-between border border-violet-600" onClick={() => invite(friend)}>
                <p>{friend.name}</p>
                <PlusIcon className="w-4 h-4" />
              </Button>
            ))}
          </InfiniteScroll> :
          <div className="w-full min-h-300 flex">
            <p className="m-auto text-3xl ">
              No Result
            </p>
          </div>
        }
      </div>
    </FormDialog>
  )
}