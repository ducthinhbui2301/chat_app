import { AuthState } from "@/redux/auth_reducer";
import { AllReducer } from "@/redux/reducer";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute() {
  const authState: AuthState = useSelector((state: AllReducer) => state.authState);
  let isApproved: boolean = false;

  if (authState.isAuthenticated && (new Date()).getTime() < (authState.validUntil ?? 0)) {
    isApproved = true;
  }

  if (isApproved) {
    return <Outlet />
  } else {
    return <Navigate to="/auth/sign-in" replace />
  }
}