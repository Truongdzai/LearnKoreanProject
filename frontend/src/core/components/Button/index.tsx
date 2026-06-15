import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function Button({ children, className = '', ...rest }: Props) {
  return (
    <button className={`btn-new ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

export default Button
