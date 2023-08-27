import { UserModel } from '@/models/user_model';
import * as actions from './actions';
import { ReduxAction } from '@/models/redux_action';

const user_string = sessionStorage.getItem('user')
const user: UserModel = typeof user_string == "string" ?
  JSON.parse(user_string) :
  null;

const valid_until_string = sessionStorage.getItem('valid_until')
const validUntil: number | null = typeof valid_until_string == "string" ?
  Number(valid_until_string) :
  null;

export interface AuthState {
  user?: UserModel,
  isAuthenticated?: boolean,
  validUntil?: number,
}

export const initialState: AuthState = user ? {
  user: user,
  isAuthenticated: true,
  validUntil: validUntil ?? undefined
} : {};

// ==============================|| AUTH REDUCER ||============================== //

export const AuthReducer = (state = initialState, action: ReduxAction<AuthState>) => {
  switch (action.type) {
    case actions.LOGIN_SUCCESS:
      sessionStorage.setItem("user", JSON.stringify(action.data.user));
      if (action.data.validUntil) {
        sessionStorage.setItem("valid_until", action.data.validUntil?.toString());
      }
      return {
        user: action.data.user,
        isAuthenticated: true,
        validUntil: action.data.validUntil
      };
    case actions.LOGOUT:
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("valid_until");
      return {};
    default:
      return state;
  }
};
