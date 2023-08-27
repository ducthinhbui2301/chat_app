export function TextArea(
  { id, name, value, onChange, onBlur, className }:
    {
      id: string,
      name?: string,
      value?: string | number,
      onChange: (e: React.ChangeEvent) => void,
      onBlur: (e: React.ChangeEvent) => void,
      className?: string,
    }
) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={"w-full min-w-[200px] h-full min-h-[50px] resize-none rounded-[7px] bg-transparent p-3 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all focus:outline-0 disabled:resize-none disabled:bg-blue-gray-50".concat(className ? ` ${className}` : '')}
      placeholder=""
    >
    </textarea>
  )
}