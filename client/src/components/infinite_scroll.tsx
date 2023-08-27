import { ArrowPathIcon } from "@heroicons/react/24/solid";
import React, { ReactNode } from "react";

export function InfiniteScroll(
  { children, isIndicatorDisplayed, isFetching, setFetching, increaseSkip }:
    {
      children: ReactNode,
      isIndicatorDisplayed: boolean,
      isFetching: boolean,
      setFetching: () => void,
      increaseSkip: () => void,
    }
) {

  const onScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const element = event.target as HTMLInputElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight && isFetching != true) {
      setFetching();
      increaseSkip();
    }
  }

  return (
    <div
      className="flex flex-col overflow-y-auto"
      onScroll={onScroll}
    >
      {children}
      {
        isIndicatorDisplayed &&
        <div className="flex">
          <ArrowPathIcon className="w-8 m-auto bg-blue-600 animate-spin" />
        </div>
      }
    </div>
  )
}