
import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, name }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <label htmlFor={name} className="flex items-center space-x-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-700 border border-slate-600'}`}>
          {checked && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-slate-300 font-medium">{label}</span>
    </label>
  );
};
