import React, { ReactNode } from 'react';
import { Drawer, SnackBar } from '@/components/index'
import { useDispatch, useSelector } from 'react-redux';
import { AllReducer } from '@/redux/reducer';
import { SocketEvent } from '../constants';
import { ALERT_INFO, HIDE_ALERT } from '@/redux/actions';

export function HomeLayout(
  { children }:
    { children: ReactNode }
) {
  const dispatch = useDispatch();

  // const authState = useSelector((state: AllReducer) => state.authState);
  const socket = useSelector((state: AllReducer) => state.socketState);

  socket.on(SocketEvent[SocketEvent.NEW_INVITATION], (data) => {
    dispatch({
      type: ALERT_INFO,
      data: `${data.userName} invite you to ${data.roomName}`
    });
    setTimeout(() => {
      dispatch({
        type: HIDE_ALERT
      });
    }, 2500)
  });

  return (
    <React.Fragment>

      <div className='w-full h-screen grid grid-cols-[300px_auto]'>
        {/* menu section */}
        <Drawer />

        {/* Page section */}
        {children}

      </div>

      {/* Alert Snackbar */}
      <SnackBar />
    </React.Fragment>
  )
}