import { PaperClipIcon } from "@heroicons/react/24/solid";
import { Button } from "."
import React, { useRef } from "react";

export function FileInput(
  { disabled, onChange }:
    {
      disabled?: boolean,
      onChange?: React.ChangeEventHandler<HTMLInputElement>
    }
) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <React.Fragment>
      <Button
        type="button"
        className="w-[100px] h-full flex"
        onClick={() => inputRef.current?.click()}
      >
        <PaperClipIcon className="w-8 h-8 m-auto" />
      </Button>
      <input
        type="file"
        ref={inputRef}
        disabled={disabled}
        onChange={onChange}
        onClick={(event) => {
          delete (event.target as HTMLInputElement)?.files?.[0]
        }}
        placeholder="Select file"
        className="hidden"
      />
    </React.Fragment>
  )
}