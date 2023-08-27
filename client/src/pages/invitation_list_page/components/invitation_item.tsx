import { Button } from "@/components/button";

export function InvitationItem(
  { label, accept, decline }:
    {
      label: string,
      accept: () => void,
      decline: () => void
    }
) {
  return (
    <div
      className="m-auto w-full flex flex-row items-center h-[60px] shadow-[0_4px_9px_-4px_#3b71ca] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] rounded-md p-4 max-w-[800px]"
    >
      <div className="flex-grow">You have invited to
        <span className="underline underline-offset-4 uppercase p-4 rounded-xl">
          {label}
        </span>
      </div>
      <div className="flex flex-row items-center gap-4">
        <Button type="button" onClick={accept}>
          Accept
        </Button>
        <Button type="button" onClick={decline}>
          Decline
        </Button>
      </div>
    </div>
  )
}