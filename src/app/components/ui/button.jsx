// ...existing code...
import React from 'react'

export function Button({
  children,
  variant = 'solid', // solid | outline | ghost
  size = 'md', // sm | md | lg | icon
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none transition-colors duration-200 select-none'
  const variants = {
    solid: 'bg-violet-600 text-white hover:bg-violet-700 shadow-md',
    outline: 'bg-transparent border border-slate-700 text-white hover:bg-slate-800',
    ghost: 'bg-transparent text-white hover:bg-white/6',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2 w-10 h-10',
  }

  const classes = `${base} ${variants[variant] || variants.solid} ${sizes[size] || sizes.md} ${className}`.trim()

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  )
}

export default Button
// ...existing code...