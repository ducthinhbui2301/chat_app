import { combineReducers } from 'redux';
import { AuthReducer, AuthState } from './auth_reducer';
import { LoginReducer } from './login_reducer';
import { SocketReducer } from './socket_reducer';
import { AlertReducer, AlertState } from './alert_reducer';
import { LoginModel } from '@/models/login_model';
import { Socket } from 'socket.io-client';

export interface AllReducer {
  socketState: Socket,
  authState: AuthState,
  loginState: LoginModel,
  alertState: AlertState,
}

const reducer = combineReducers({
  socketState: SocketReducer,
  authState: AuthReducer,
  loginState: LoginReducer,
  alertState: AlertReducer,
});

export default reducer;
