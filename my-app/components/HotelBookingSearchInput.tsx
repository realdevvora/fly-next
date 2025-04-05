import React, { useState } from 'react';

interface BookingSearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: 'date' | 'text';
  placeholder: string;
  required?: boolean;
}

const BookingSearchInput: React.FC<BookingSearchInputProps> = ({
  label,
  value,
  onChange,
  type,
  placeholder,
  required = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-white">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default BookingSearchInput;
