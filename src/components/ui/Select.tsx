import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className = "", id, children, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-500/20"
            : "border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
        }`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;