'use client';
import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { Airport } from '@/types';

interface FlightSearchInputProps {
  type: 'source' | 'destination';
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function FlightSearchInput({
  type,
  value,
  onChange,
  placeholder,
  className = '',
  required = false
}: FlightSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update input value when value prop changes (e.g., from context)
  useEffect(() => {
    if (value !== inputValue && value !== '') {
      setInputValue(value);
    }
  }, [value]);

  // Determine if dark mode is active
  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Position dropdown under input
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 0
  });

  useEffect(() => {
    if (inputRef.current && isOpen) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen, inputValue]);

  // Mock function for fetching airport suggestions
  // In a real app, this would be replaced with the actual API call
  const fetchSuggestions = debounce(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchTerm })
      });
      
      const data = await response.json();
      
      if (data.airports) {
        setSuggestions(data.airports);
      } else {
        // Mock data for development if API doesn't respond correctly
        const mockAirports: Airport[] = [
          { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
          { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
          { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' }
        ];
        
        setSuggestions(
          mockAirports.filter(airport => 
            airport.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
            airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            airport.code.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    onChange(newValue);
    fetchSuggestions(newValue);
  };

  // Handle selection of an airport from suggestions
  const handleSelectSuggestion = (airport: Airport) => {
    const displayValue = `${airport.city} - ${airport.code}`; // Format display as "City - Code"
    setInputValue(displayValue);
    setIsOpen(false);
    setSuggestions([]);
    onChange(airport.code, airport); // Pass both code and full airport object
  };

  return (
    <>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length >= 2) {
              setIsOpen(true);
              fetchSuggestions(inputValue);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full p-3 text-lg rounded-lg transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
          } ${className}`}
          aria-label={`${type === 'source' ? 'Departure' : 'Arrival'} airport`}
        />
      </div>
      {isOpen && suggestions.length > 0 && mounted && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${dropdownStyle.top}px`,
            left: `${dropdownStyle.left}px`,
            width: `${dropdownStyle.width}px`,
            maxHeight: '300px'
          }}
          className={`rounded-lg shadow-2xl overflow-y-auto z-[9999] transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 shadow-black/50'
              : 'bg-white border border-gray-200 shadow-gray-200/50'
          }`}
        >
          {suggestions.map((airport) => (
            <div
              key={`${airport.code}`}
              className={`p-3 cursor-pointer ${
                isDark
                  ? 'border-b border-gray-700 last:border-b-0 hover:bg-gray-700'
                  : 'border-b border-gray-100 last:border-b-0 hover:bg-gray-50'
              }`}
              onClick={() => handleSelectSuggestion(airport)}
            >
              <div className={`font-medium text-base ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {airport.city} - {airport.code}
              </div>
              <div className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {airport.name}, {airport.country}
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}