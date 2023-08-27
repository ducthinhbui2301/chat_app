import { SocketEvent } from "@/constants/socket_events";
import { MessageReadEventData } from "@/models/socket_model";
import { AllReducer } from "@/redux/reducer";
import { useState } from "react";
import { useSelector } from "react-redux";

export function Typing() {
  const [typer, setTyper] = useState<string | undefined>();
  const socket = useSelector((state: AllReducer) => state.socketState);

  socket.on(SocketEvent[SocketEvent.TYPING], (data: MessageReadEventData) => {
    setTyper(data.senderId ?? "Someone");
  });

  socket.on(SocketEvent[SocketEvent.TYPING_END], () => {
    setTyper(undefined);
  });

  return typer != undefined ? (
    <div>{typer} is typing</div>
  ) : null;
}