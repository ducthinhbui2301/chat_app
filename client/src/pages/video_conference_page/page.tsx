// import { SERVICE_URL, USER_API } from "@/constants/api_constants";
// import { LoadResponse } from "@/models/load_response";
// import { UserModel } from "@/models/user_model";
import { AllReducer } from "@/redux/reducer";
import Peer from "simple-peer";
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { SocketEvent } from "@/constants/socket_events";
import { ALERT_ERROR, HIDE_ALERT } from "@/redux/actions";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/button";
import { SocketEmitter } from "@/constants/socket_emitters";
import { UserModel } from "@/models/user_model";

export function VideoConferencePage() {
  const navigate = useNavigate();
  const loginUser: UserModel | undefined = useSelector((state: AllReducer) => state.authState)?.user;
  const socket = useSelector((state: AllReducer) => state.socketState);
  const dispatch = useDispatch();
  const { roomId } = useParams();
  // const loginUser: UserModel | undefined = useSelector((state: AllReducer) => state.authState)?.user;

  // const [friendList, setFriendList] = useState<UserModel[]>([]);
  // const [friendTotalNumber, setFriendTotalNumber] = useState<number>(0);

  // const otherVideo = useRef<HTMLVideoElement>(null);
  // const selfVideo = useRef<HTMLVideoElement>(null);

  // useEffect(() => {
  //   fetchFriendList();
  // }, [])

  // const fetchFriendList = async () => {
  //   try {
  //     const response = await fetch((`${SERVICE_URL}${USER_API}/loadfriends/${loginUser?.id}`),
  //       {
  //         method: "GET",
  //         credentials: 'include',
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //     if (response.status == 200) {
  //       const data: LoadResponse<UserModel> = await response.json();
  //       setFriendList(data?.data ?? []);
  //       setFriendTotalNumber(data?.total ?? []);
  //     } else {
  //       alert("cannot fetch invitation list");
  //     }
  //   } catch {
  //     alert("error happened");
  //   }
  // }

  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ peerID: string, peer: Peer.Instance }[]>([]);

  const videoConstraints = {
    height: window.innerHeight,
    width: window.innerWidth
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
        const peer = createPeer(stream);
        peersRef.current.push({
          peerID: loginUser?.id as string,
          peer,
        })

        socket.on(SocketEvent[SocketEvent.VIDEO_CALL_JOIN], (payload: {
          userId: string,
          signal: string | Peer.SignalData
        }) => {
          if (payload.userId != loginUser?.id && peersRef.current?.some((p) => p.peerID != payload.userId)) {
            const newPeer = addPeer(payload.userId, stream);
            newPeer.signal(payload.signal)
            peersRef.current.push({
              peerID: payload.userId,
              peer: newPeer,
            })

            setPeers(ps => [...ps, newPeer]);
          }
        });

        socket.on(SocketEvent[SocketEvent.RECEIVE_SIGNAL], (payload: {
          userId: string,
          signal: string | Peer.SignalData
        }) => {
          console.log(SocketEvent[SocketEvent.RECEIVE_SIGNAL])
          console.log(payload.userId != loginUser?.id)
          if (!peersRef.current?.some((p) => p.peerID != payload.userId)) {
            const item = peersRef.current.find(p => p.peerID === payload.userId);
            if (item) {
              item.peer.signal(payload.signal);
              setPeers(ps => [...ps, item.peer]);
            }
          }
        });

        socket.on(SocketEvent[SocketEvent.VIDEO_CALL_END], (payload: {
          userId: string
        }) => {
          if (peersRef?.current) {
            const targetPeer = peersRef.current.find(p => p.peerID === payload.userId);
            if (targetPeer) {
              const peerIndex = peersRef.current.indexOf(targetPeer);
              targetPeer?.peer.destroy();
              peersRef.current = peersRef.current.filter((_, index) => index != peerIndex);
              setPeers(peers.filter((_, index) => index != peerIndex));
            }
          }
        });

      }
    }).catch(() => {
      dispatch({
        type: ALERT_ERROR,
        data: "please turn on camera and mic to use this function"
      });
      setTimeout(() => {
        dispatch({
          type: HIDE_ALERT
        });
      }, 3000)
    })
  }, []);

  const endCall = () => {
    socket.emit(SocketEmitter[SocketEmitter.STOP_VIDEO_CALL], {
      roomId: roomId,
      userId: loginUser?.id,
    })
    if (userVideo.current?.srcObject) {
      (userVideo.current?.srcObject as MediaStream)?.getTracks().forEach(function (track) {
        track.stop();
      })
    }
  }

  const goBack = () => {
    if (userVideo.current?.srcObject) {
      (userVideo.current?.srcObject as MediaStream)?.getTracks().forEach(function (track) {
        track.stop();
      })
    }
    navigate('/room-chat');
  }

  function createPeer(stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });
    peer.on("signal", signal => {
      socket.emit(SocketEmitter[SocketEmitter.JOIN_VIDEO_CALL], {
        roomId: roomId,
        userId: loginUser?.id,
        signal: signal
      })
    })

    return peer;
  }

  function addPeer(userId: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    peer.on("signal", signal => {
      socket.emit(SocketEmitter[SocketEmitter.RETURN_SIGNAL], {
        roomId: roomId,
        userId: userId,
        signal: signal
      })
    })

    return peer;
  }

  return (
    <div className="flex flex-col p-4 w-full h-screen overflow-hidden">
      <div className="flex-grow w-full h-full flex flex-wrap overflow-auto">
        {/* selft video */}
        <video className="w-1/2 aspect-[4/3] border border-red-600" ref={userVideo} autoPlay playsInline />

        {/* remote videos */}
        {peers.map((peer, index) => {
          return (
            <Video key={index} peer={peer} />
          );
        })}
      </div>
      <div className="w-full h-[100px] flex">
        <Button type="button" className=" m-auto" onClick={goBack}>
          Back
        </Button>
        <Button type="button" className=" m-auto" onClick={endCall}>
          End Call
        </Button>
      </div>
    </div>
  );
}

const Video = ({ peer }: { peer: Peer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", stream => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    })
  }, []);

  return (
    <video className="w-1/2 aspect-[4/3] border border-red-600" playsInline autoPlay ref={ref} />
  );
}