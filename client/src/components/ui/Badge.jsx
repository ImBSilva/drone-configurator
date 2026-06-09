

export function Badge({ 
  children, 
  variant = 'neutral', 
  className = '', 
  ...props 
}) {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase'
  
  const variants = {
    neutral: 'bg-industrial-surface text-industrial-muted border border-industrial-border',
    accent: 'bg-industrial-accent-muted/20 text-industrial-accent border border-industrial-accent/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  }

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
export default Badge
