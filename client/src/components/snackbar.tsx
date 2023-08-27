import { AlertPriority } from "@/redux/alert_reducer";
import { AllReducer } from "@/redux/reducer";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";

export function SnackBar() {
  const alertState = useSelector((state: AllReducer) => state.alertState);

  return alertState.isOpen ? (
    <div className={"absolute bottom-[40px] left-[40px] border-t-4 rounded-b px-6 py-6 shadow-md h-fit w-fit".concat(
      alertState.priority == AlertPriority.Success ? "bg-green-100 border-green-500 text-green-500" : (
        alertState.priority == AlertPriority.Error ? "bg-red-100 border-red-500 text-red-500" :
          "bg-teal-100 border-teal-500 text-teal-500"
      )
    )} role="alert">
      <div className="flex">
        <ExclamationCircleIcon className={"fill-current h-6 w-6 mr-4".concat(
      alertState.priority == AlertPriority.Success ? "text-green-500" : (
        alertState.priority == AlertPriority.Error ? "text-red-500" :
          "text-teal-500"
      )
    )} />
        <div>
          <p className="font-bold">{alertState.priority}</p>
          <p className="text-sm">{alertState.message}</p>
        </div>
      </div>
    </div>
  ) : null;
}