import { ReactNode } from "react";
import { Button } from "..";

export function MenuItem(
  { label, icon, onClick, pathName }:
    { label: string, icon: ReactNode, onClick: () => void, pathName: string }
) {
  const currentPathname = window.location.pathname;

  return (
    <div className="flex flex-col w-full cursor-pointer">
      <Button
        type="button"
        className={"w-full flex flex-row items-center h-[80px]".concat(pathName == currentPathname ? ' bg-blue-600' : '')}
        onClick={onClick}
      >
        <span className="inline-block w-8 h-8 m-4">
          {icon}
        </span>
        <span className="text-lg">
          {label}
        </span>
      </Button>
    </div>
  )
}