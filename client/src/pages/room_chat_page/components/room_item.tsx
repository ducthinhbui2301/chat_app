import { Button } from "@/components/button";

export function RoomItem(
  { label, isDisplayed, onClick }:
    { label: string, isDisplayed: boolean, onClick: () => void }
) {
  return (
    <Button
      type="button"
      className={"w-full min-h-[80px]".concat(isDisplayed ? " bg-violet-600" : "")}
      onClick={onClick}
    >
      <p>{label}</p>
    </Button>
  )
}