import * as actions from './actions';
import { ReduxAction } from '@/models/redux_action';
import { LoginModel } from '@/models/login_model';

const login_data_string = sessionStorage.getItem('login_data')
const loginData: LoginModel = typeof login_data_string == "string" ?
  JSON.parse(login_data_string) :
  null;

export const initialState: LoginModel = loginData ? {
  email: loginData.email,
  password: loginData.password,
} : {};

// ==============================|| LOGIN REDUCER ||============================== //

export const LoginReducer = (state = initialState, action: ReduxAction<LoginModel>) => {
  switch (action.type) {
    case actions.SAVE_LOGIN_DATA:
      sessionStorage.setItem("login_data", JSON.stringify(action.data));
      return {
        email: action.data.email,
        password: action.data.password
      };
    case actions.CLEAR_LOGIN_DATA:
      sessionStorage.removeItem("login_data");
      return {};
    default:
      return state;
  }
};
