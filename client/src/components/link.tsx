export function Link(
  { label, href }:
    { label: string, href: string }
) {
  return (
    <a
      href={href}
      className="text-danger transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
    >
      {label}
    </a>
  )
}