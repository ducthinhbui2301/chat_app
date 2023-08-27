import * as actions from './actions';
import { ReduxAction } from '@/models/redux_action';

export enum AlertPriority {
  Success,
  Error,
  Info
}

export interface AlertState {
  message?: string,
  priority?: AlertPriority,
  isOpen?: false
}

export const initialState: AlertState = {
  message: '',
  priority: undefined,
  isOpen: false
};

// ==============================|| ALERT REDUCER ||============================== //

export const AlertReducer = (state = initialState, action: ReduxAction<string>) => {
  switch (action.type) {
    case actions.ALERT_SUCCESS:
      return {
        message: action.data,
        priority: AlertPriority[AlertPriority.Success],
        isOpen: true
      };
    case actions.ALERT_ERROR:
      return {
        message: action.data,
        priority: AlertPriority[AlertPriority.Error],
        isOpen: true
      };
    case actions.ALERT_INFO:
      return {
        message: action.data,
        priority: AlertPriority[AlertPriority.Info],
        isOpen: true
      };
    case actions.HIDE_ALERT:
      return {};
    default:
      return state;
  }
};
