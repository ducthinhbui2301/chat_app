import { useState, useEffect } from "react";
import { RoomModel } from "@/models/room_model";
// import { LoadResponse } from "@/models/load_response";
import { useDispatch, useSelector } from "react-redux";
import { AllReducer } from "@/redux/reducer";
import { UserModel } from "@/models/user_model";
import { InvitationItem } from "./components";
import { SERVICE_URL, USER_API } from "@/constants/api_constants";
import { ALERT_ERROR, HIDE_ALERT } from "@/redux/actions";

export function InvitationListPage() {
  const dispatch = useDispatch();
  const loginUser: UserModel | undefined = useSelector((state: AllReducer) => state.authState)?.user;
  const [invitationList, setInvitationList] = useState<RoomModel[]>(loginUser?.roomInvitedList as RoomModel[] ?? []);

  useEffect(() => {
    fetchInvitationList();
  }, []);

  const fetchInvitationList = async () => {
    try {
      const response = await fetch((`${SERVICE_URL}${USER_API}/loadinvitations/${loginUser?.id}`),
        {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        });
      if (response.status == 200) {
        const data: RoomModel[] = await response.json();
        setInvitationList(data);
      } else {
        dispatch({
          type: ALERT_ERROR,
          data: "cannot fetch invitation list"
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

  const accept = async ({ roomInvitedList }: UserModel) => {
    try {
      const response = await fetch((`${SERVICE_URL}${USER_API}/acceptinvitation/${loginUser?.id}`),
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomInvitedList
          })
        });
      if (response.status == 200) {
        const newInvitationList = invitationList.filter((i) => !(roomInvitedList as string[]).some((ri) => ri == i.id));
        setInvitationList(newInvitationList);
      } else {
        dispatch({
          type: ALERT_ERROR,
          data: "accept fail"
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

  const decline = async ({ roomInvitedList }: UserModel) => {
    try {
      const response = await fetch((`${SERVICE_URL}${USER_API}/declineinvitation/${loginUser?.id}`),
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomInvitedList
          })
        });
      if (response.status == 200) {
        const newInvitationList = invitationList.filter((i) => !(roomInvitedList as string[]).some((ri) => ri == i.id));
        setInvitationList(newInvitationList);
      } else {
        dispatch({
          type: ALERT_ERROR,
          data: "cannot fetch invitation list"
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
    <div className="h-full w-full border-4 border-violet-600 rounded-xl">
      {/* group chat list section */}
      <p className="p-4 text-4xl w-full text-center">
        Your Invitation List
      </p>
      <div className="flex flex-col p-2">
        {
          invitationList.map((item, index) => (
            <InvitationItem
              key={index}
              label={item.name ?? "Unknown"}
              accept={() => item.id ? accept({ roomInvitedList: [item.id] }) : null}
              decline={() => item.id ? decline({ roomInvitedList: [item.id] }) : null}
            />
          ))

        }
      </div>
    </div>
  )
}
