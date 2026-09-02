import { useEffect, useId, useMemo, useRef, useState } from "react";

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const selectedOptionRef = useRef(null);
  const inputId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(normalizedQuery) ||
        String(opt.value).toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || query.trim() || !value) return undefined;

    const frame = window.requestAnimationFrame(() => {
      selectedOptionRef.current?.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, query, value, filteredOptions]);

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
    closeDropdown();
  };

  const inputValue = open ? query : selectedOption?.label || "";

  return (
    <div ref={containerRef} className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className="input bg-white pr-9"
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          autoComplete="off"
          onFocus={openDropdown}
          onClick={openDropdown}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
        />

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>

        {open && !disabled && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">
                No matches found
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    ref={isSelected ? selectedOptionRef : null}
                  >
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-primary-50 ${
                        isSelected
                          ? "bg-primary-50 font-medium text-primary-700"
                          : "text-gray-700"
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(option)}
                    >
                      <span>{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
