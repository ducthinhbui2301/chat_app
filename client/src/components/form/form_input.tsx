export function FormInput(
  { id, type, name, value, onChange, onBlur, className, placeholder }:
    {
      id: string,
      type?: string,
      name?: string,
      value?: string | number,
      onChange: (e: React.ChangeEvent) => void,
      onBlur: (e: React.ChangeEvent) => void,
      className?: string,
      placeholder?: string,
    }
) {
  return (
    <input
      id={id}
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={"h-12 min-w-[250px] rounded-md px-4".concat(className ? ` ${className}` : ' first-line:first-letter:marker:file:')}
    ></input>
  )
}