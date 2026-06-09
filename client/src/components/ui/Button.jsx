

export function Button({ 
  children, 
  variant = 'secondary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-body font-medium rounded transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border'
  
  const variants = {
    primary: 'bg-industrial-accent border-industrial-accent hover:bg-industrial-accent-hover text-white font-semibold shadow-sm shadow-industrial-accent-muted/30',
    secondary: 'bg-industrial-surface border-industrial-border hover:bg-industrial-surface-hover text-industrial-fg',
    ghost: 'border-transparent bg-transparent hover:border-industrial-border hover:bg-industrial-surface text-industrial-fg-secondary hover:text-industrial-fg',
    outline: 'border-industrial-accent text-industrial-accent bg-transparent hover:bg-industrial-accent-muted hover:border-industrial-accent',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-mono',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
export default Button
