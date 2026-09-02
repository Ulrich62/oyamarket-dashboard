import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg bg-bg-elev border border-line py-2.5 px-3.5 text-[13px] text-ink placeholder:text-ink-4 outline-none transition duration-150",
            "focus:border-ink-3 focus:bg-bg-elev-2",
            error && "border-red-500/60 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        {hint && !error && <p className="text-[11px] text-ink-4">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg bg-bg-elev border border-line py-2.5 px-3.5 text-[13px] text-ink placeholder:text-ink-4 outline-none transition duration-150 resize-none",
            "focus:border-ink-3 focus:bg-bg-elev-2",
            error && "border-red-500/60 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        {hint && !error && <p className="text-[11px] text-ink-4">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ─── Select ──────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg bg-bg-elev border border-line py-2.5 px-3.5 text-[13px] text-ink outline-none transition duration-150 cursor-pointer",
            "focus:border-ink-3 focus:bg-bg-elev-2",
            error && "border-red-500/60",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
