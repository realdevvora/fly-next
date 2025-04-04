'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import { useAuth } from '@/providers/AuthProvider';

/*
    This is the edit profile page.
    Protected with AuthProvider to ensure only authenticated users can access it.
*/
export default function EditProfile() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    
    const [formData, setFormData] = useState({
        newEmail: '',
        phoneNumber: '',
        password: '',
        newPassword: '',
        prefersDarkMode: false
    });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Authentication check and redirect
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            // Redirect to login page if not authenticated
            router.push('/login');
        }
    }, [isLoggedIn, authLoading, router]);

    // Initialize the dark mode preference based on the current theme
    useEffect(() => {
        setFormData(prevData => ({
            ...prevData,
            prefersDarkMode: theme === 'dark'
        }));
    }, [theme]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDarkModeToggle = (checked: boolean) => {
        // Only update the form state, don't change theme immediately
        setFormData({ ...formData, prefersDarkMode: checked });
        // We'll apply the theme change only when the form is submitted successfully
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.password) {
            alert('Current password is required');
            return;
        }

        // Create FormData object
        const submitFormData = new FormData();
        
        // Only append non-empty values
        if (formData.newEmail) submitFormData.append('newEmail', formData.newEmail);
        if (formData.phoneNumber) submitFormData.append('phoneNumber', formData.phoneNumber);
        if (formData.password) submitFormData.append('password', formData.password);
        if (formData.newPassword) submitFormData.append('newPassword', formData.newPassword);
        submitFormData.append('prefersDarkMode', formData.prefersDarkMode.toString());
        if (profilePicture) submitFormData.append('profilePicture', profilePicture);
        
        try {
            const response = await fetch('/api/accounts/editProfile', {
                method: 'PUT',
                body: submitFormData,
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                // Apply theme change when form is successfully submitted
                setTheme(formData.prefersDarkMode ? 'dark' : 'light');
                
                alert('Profile updated successfully. Please log in again with your new credentials.');
                
                // Logout the user
                await fetch('/api/accounts/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                // Redirect to login page
                router.push('/login');
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            alert('An error occurred while updating profile');
            console.error('Profile update error:', error);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If not logged in, don't render the content (the useEffect will handle redirect)
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                        Edit Your Profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Update your account information
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {/* Profile Picture Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Profile Picture
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
                                {previewUrl && (
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={previewUrl}
                                            alt="Profile preview"
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    aria-label="Upload profile picture"
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        dark:file:bg-blue-900 dark:file:text-blue-300
                                        hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Email address
                            </label>
                            <input
                                id="newEmail"
                                name="newEmail"
                                type="email"
                                autoComplete="email"
                                value={formData.newEmail}
                                onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                autoComplete="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Current Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                autoComplete="new-password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="prefersDarkMode"
                                name="prefersDarkMode"
                                type="checkbox"
                                checked={formData.prefersDarkMode}
                                onChange={(e) => handleDarkModeToggle(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
                            />
                            <label htmlFor="prefersDarkMode" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                Enable Dark Mode
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}