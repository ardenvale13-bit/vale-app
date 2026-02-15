interface CategoryHeaderProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryHeader({ label, size = 'md' }: CategoryHeaderProps) {
  const sizeStyles = {
    sm: { fontSize: '1.25rem' },
    md: { fontSize: '1.5rem' },
    lg: { fontSize: '1.75rem' },
  };

  return (
    <span
      style={{
        fontFamily: "'Delicious Handrawn', cursive",
        background: 'linear-gradient(90deg, #fc9ada 0%, #d19bea 50%, #98bbf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
        ...sizeStyles[size],
      }}
    >
      {label}
    </span>
  );
}
