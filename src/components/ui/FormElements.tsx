import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, required, icon, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="bv-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`bv-input ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, required, options, className = '', ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="bv-label">
        {label}
        {required && <span className="required-star">*</span>}
      </label>
    )}
    <select className={`bv-input bg-white ${className}`} {...props}>
      <option value="">Seleccione...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => (
  <label className="flex items-center gap-3 cursor-pointer py-2">
    <input
      type="checkbox"
      className="accent-bolivar-green h-5 w-5 rounded border-gray-300"
      {...props}
    />
    <span className="text-sm text-text-main">{label}</span>
  </label>
);

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  id,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (defaultOpen) {
      setIsOpen(true);
    }
  }, [defaultOpen]);

  return (
    <div className="mb-3 border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm" id={id}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-base text-bolivar-green font-semibold">{title}</h3>
        <svg
          className={`w-5 h-5 text-bolivar-green transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="px-6 pb-2">{children}</div>
      </div>
    </div>
  );
};

interface SmartQuestionProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export const SmartQuestion: React.FC<SmartQuestionProps> = ({
  label,
  name,
  value,
  onChange,
  required,
  disabled,
}) => (
  <div className={`py-3 border-b border-gray-100 flex items-start justify-between gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <p className="text-text-main text-sm flex-1">
      {label} {required && <span className="required-star">*</span>}
    </p>
    <div className="flex gap-2 bg-gray-100 p-1 rounded-pill w-[120px] shrink-0">
      {['SI', 'NO'].map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(name, opt)}
          className={`flex-1 px-3 py-1 rounded-pill text-xs font-bold transition-all ${
            value === opt
              ? 'bg-bolivar-yellow text-bolivar-green'
              : 'text-bolivar-sec hover:bg-gray-200'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);
