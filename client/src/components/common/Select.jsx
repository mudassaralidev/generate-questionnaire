export default function Select({ label, options = [], placeholder, className = '', ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select className={`input bg-white ${className}`} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
