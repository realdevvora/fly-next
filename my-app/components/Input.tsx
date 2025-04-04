import React, { forwardRef, memo } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type,
  name,
  placeholder,
  value,
  onChange,
  required,
  maxLength,
  pattern,
  className = "",
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      maxLength={maxLength}
      pattern={pattern}
      className={`w-full p-2 border rounded-lg ${className}`}
      {...props}
    />
  );
});

// Set display name for debugging purposes
Input.displayName = 'Input';

// Using memo to prevent unnecessary re-renders
export default memo(Input);