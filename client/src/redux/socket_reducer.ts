import { UserModel } from "@/models/user_model";
import * as actions from './actions';
import { io, Socket } from "socket.io-client";
import { ReduxAction } from "@/models/redux_action";
import { SOCKET_URL } from "../constants";
import { RoomModel } from "@/models/room_model";

const user_string = sessionStorage.getItem('user')
const user: UserModel | undefined = typeof user_string == "string" ?
  JSON.parse(user_string) :
  null;

const connectOptions = {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 99999,
}
let socket: Socket = io(SOCKET_URL, {
  ...connectOptions,
  query: {
    id: user?.id,
    roomList: user?.roomList
  },
});

export const SocketReducer = (state = io(), action: ReduxAction<UserModel>) => {
  switch (action.type) {
    case actions.INIT_SOCKET:
      socket = io(SOCKET_URL, {
        ...connectOptions,
        query: {
          id: action.data.id,
          roomList: (action.data.roomList as RoomModel[])?.map((r) => r.id)
        }
      });
      socket.connect();
      return socket;
    default:
      return state;
  }
};