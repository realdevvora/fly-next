import React from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { CheckoutFormData } from "./BookingItem";

interface CheckoutModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: CheckoutFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  processing: boolean;
  cardNumberPattern: string;
  expiryDatePattern: string;
  error: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  onSubmit,
  formData,
  onChange,
  processing,
  cardNumberPattern,
  expiryDatePattern,
  error
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Complete Your Purchase</h2>
        <button 
            aria-label="Close"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={processing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cardholder Name
          </label>
          <Input
            id="cardholderName"
            name="cardholderName"
            type="text"
            value={formData.cardholderName}
            onChange={onChange}
            required
            placeholder="John Doe"
            disabled={processing}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Number
          </label>
          <Input
            id="cardNumber"
            name="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={onChange}
            required
            placeholder="1234567890123456"
            pattern={cardNumberPattern}
            maxLength={16}
            disabled={processing}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">16 digits, no spaces</p>
        </div>

        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date
          </label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="text"
            value={formData.expiryDate}
            onChange={onChange}
            required
            placeholder="MM/YY"
            pattern={expiryDatePattern}
            maxLength={5}
            disabled={processing}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Format: MM/YY</p>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 hover:bg-gray-400 px-4 py-2 rounded-lg"
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg"
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Complete Payment"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutModal;