export function ErrorText(
  { value }:
    { value: string }
) {
  return (
    <p className="text-red-600 mr-auto">
      {value}
    </p>
  )
}