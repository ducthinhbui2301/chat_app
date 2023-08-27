import { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export function FormDialog(
  { openState, setOpen, title, children }:
    {
      openState: boolean,
      setOpen: (open: boolean) => void,
      title: string | ReactNode,
      children: string | ReactNode,
    }
) {

  return (
    <div className={"overflow-y-auto absolute top-0 left-0 w-screen h-screen sm:p-0 pt-4 pr-4 pb-20 pl-4 bg-black/80".concat(openState ? " flex" : " hidden")}>
      <div className="flex justify-center items-end text-center m-auto max-h-[600px] sm:block w-fit max-w-[600px] overflow-clip bg-gray-100 dark:bg-[#242424] rounded-md">
        <div
          className="flex flex-shrink-0 items-center justify-between rounded-t-md border-b-2 border-neutral-100 border-opacity-100 p-4 dark:border-opacity-50 w-full">
          {/* Dialog Title */}
          <h5
            className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200"
            id="exampleModalLabel">
            {title}
          </h5>

          {/* Dialog Close Button */}
          <button onClick={() => setOpen(false)} className="border-none bg-transparent flex ml-auto">
            <XMarkIcon className="w-8 h-8 m-auto" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="relative flex-auto p-4" data-te-modal-body-ref>
          {children}
        </div>

      </div>
    </div>
  );
}