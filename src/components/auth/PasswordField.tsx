"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  id?: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  required?: boolean;
  helperText?: string;
};

export function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
  minLength,
  required,
  helperText
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? `password-${generatedId}`;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-11 text-slate-900 outline-none ring-expoBlue/20 focus:border-expoBlue focus:ring-2"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((previous) => !previous)}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        >
          {visible ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
        </button>
      </div>
      {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
