export default function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input
        className={`input ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
