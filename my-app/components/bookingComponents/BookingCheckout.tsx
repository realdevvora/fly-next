'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { Card, CardContent } from "@/components/Card";

interface FormData {
    bookingId: string;
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
}

const Input: React.FC<{
    type: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    maxLength?: number;
    pattern?: string;
}> = ({ type, name, placeholder, value, onChange, required, maxLength, pattern }) => {
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            maxLength={maxLength}
            pattern={pattern}
            className="w-full p-2 border rounded-lg"
        />
    );
};

const BookingCheckout: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        bookingId: "",
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null); // For storing PDF data
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false); // Track payment success

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/bookings/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Payment successful!");
                setIsPaymentSuccessful(true);

                const pdfResponse = await fetch(`/api/bookings/${formData.bookingId}/invoice`);
                if (pdfResponse.ok) {
                    const pdfBlob = await pdfResponse.blob();
                    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
                    setPdfData(new Uint8Array(pdfArrayBuffer)); 
                } else {
                    setMessage("Failed to generate invoice");
                }
            } else {
                setMessage(data.error || "Failed to process payment");
            }
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    const openPdfInNewTab = () => {
        if (pdfData) {
            const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");
        }
    };

    const cardNumberPattern = "^[0-9]{16}$";
    const expiryDatePattern = "^(0[1-9]|1[0-2])\\/([0-9]{2})$";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-4 bg-white shadow-lg rounded-xl"> {/* Adjust max-w-lg to max-w-md for a smaller window */}
                <CardContent>
                    <h2 className="text-2xl font-bold text-center mb-6">Booking Checkout</h2>
                    {message && <p className="text-center text-red-500">{message}</p>}

                    {!isPaymentSuccessful ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="text"
                                name="bookingId"
                                placeholder="Booking ID"
                                value={formData.bookingId}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="text"
                                name="cardholderName"
                                placeholder="Cardholder Name"
                                value={formData.cardholderName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="number"
                                name="cardNumber"
                                placeholder="Card Number (16 digits)"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                required
                                maxLength={16}
                                pattern={cardNumberPattern}
                            />
                            <Input
                                type="text"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                                pattern={expiryDatePattern}
                            />
                            <Button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg" disabled={loading}>
                                {loading ? "Processing..." : "Checkout"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">Payment Successful!</h3>
                            <Button onClick={openPdfInNewTab} className="w-full mt-4 bg-green-600 text-white p-2 rounded-lg">
                                Open Invoice PDF in New Tab
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BookingCheckout;
