export default function ErrorAlert({ message, errors = [] }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {errors.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-xs text-red-600">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
