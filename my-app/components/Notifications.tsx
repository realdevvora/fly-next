'use client';

import React, { useEffect, useState, useRef } from 'react';
import Bell from '@/public/bell.svg';
import Image from 'next/image';
import { useTheme } from 'next-themes'; // Import for theme support

interface BaseNotification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  userId: string;
}

interface UserNotification extends BaseNotification {
  // User-specific notification fields
}

interface BookingRoom {
  roomType: {
    name: string;
  };
  hotel: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
}

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  roomBookings: BookingRoom[];
}

interface OwnerNotification extends BaseNotification {
  booking: Booking;
}

type NotificationType = 'user' | 'owner';

const Notifications: React.FC = () => {
  const { theme } = useTheme(); // Get current theme
  const [activeTab, setActiveTab] = useState<NotificationType>('user');
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [ownerNotifications, setOwnerNotifications] = useState<OwnerNotification[]>([]);
  const [unreadUserCount, setUnreadUserCount] = useState(0);
  const [unreadOwnerCount, setUnreadOwnerCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch user notifications
  const fetchUserNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user notifications');
      }

      const data = await response.json();
      setUserNotifications(data.notifications || []);
      // Fix: Count only unread notifications
      setUnreadUserCount(
        (data.notifications || []).filter((note: UserNotification) => !note.isRead).length
      );
    } catch (err) {
      console.error('Error fetching user notifications:', err);
    }
  };

  // Fetch owner notifications
  const fetchOwnerNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/owner', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch owner notifications');
      }

      const data = await response.json();
      setOwnerNotifications(data.notifications || []);
      // Fix: Use the unread count from server or calculate it
      const unreadCount = data.unreadCount ?? 
        (data.notifications || []).filter((note: OwnerNotification) => !note.isRead).length;
      setUnreadOwnerCount(unreadCount);
    } catch (err) {
      console.error('Error fetching owner notifications:', err);
    }
  };

  // Fetch all notifications
  const fetchAllNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserNotifications(),
        fetchOwnerNotifications()
      ]);
    } catch (err) {
      setError('Error loading notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark user notifications as read
  const markUserNotificationsAsRead = async (notificationIds: string[]) => {
    if (!notificationIds.length) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Fix: Update local state to mark as read instead of removing
      setUserNotifications(prev => 
        prev.map(note => {
          if (notificationIds.includes(note.id)) {
            return { ...note, isRead: true };
          }
          return note;
        })
      );
      setUnreadUserCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error('Error marking user notifications as read:', err);
    }
  };

  // Mark owner notifications as read
  const markOwnerNotificationsAsRead = async (notificationIds: string[]) => {
    if (!notificationIds.length) return;

    try {
      const response = await fetch('/api/notifications/owner', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark owner notifications as read');
      }

      // Update local state
      setOwnerNotifications(prev => {
        return prev.map(note => {
          if (notificationIds.includes(note.id)) {
            return { ...note, isRead: true };
          }
          return note;
        });
      });
      setUnreadOwnerCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error('Error marking owner notifications as read:', err);
    }
  };

  // Handle clicking on a notification
  const handleNotificationClick = (id: string) => {
    if (activeTab === 'user') {
      markUserNotificationsAsRead([id]);
    } else {
      markOwnerNotificationsAsRead([id]);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (activeTab === 'user') {
      const notificationIds = userNotifications
        .filter(notification => !notification.isRead)
        .map(notification => notification.id);
      markUserNotificationsAsRead(notificationIds);
    } else {
      const notificationIds = ownerNotifications
        .filter(notification => !notification.isRead)
        .map(notification => notification.id);
      markOwnerNotificationsAsRead(notificationIds);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchAllNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      if (!isOpen) fetchAllNotifications();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when the dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchAllNotifications();
    }
  }, [isOpen]);

  // Format booking details for display
  const formatBookingDetails = (notification: OwnerNotification) => {
    if (!notification.booking) return notification.message || 'New booking';
    
    const booking = notification.booking;
    const hotel = booking.roomBookings?.[0]?.hotel;
    const roomType = booking.roomBookings?.[0]?.roomType;
    
    if (!hotel || !roomType) return notification.message || 'New booking';
    
    const checkIn = new Date(booking.checkIn).toLocaleDateString();
    const checkOut = new Date(booking.checkOut).toLocaleDateString();
    
    return `New booking at ${hotel.name} for ${roomType.name} from ${checkIn} to ${checkOut}`;
  };

  // Get total unread count
  const totalUnreadCount = unreadUserCount + unreadOwnerCount;
  
  // Dark/light mode compatible styles
  const getThemeStyles = () => {
    return {
      bellButton: 'relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
      dropdownContainer: 'absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      header: 'p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center',
      headerTitle: 'font-medium dark:text-white',
      markAllBtn: 'text-xs text-blue-600 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300',
      tabsContainer: 'flex border-b border-gray-100 dark:border-gray-700',
      activeTab: 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400',
      inactiveTab: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
      tabBase: 'flex-1 py-2 text-sm font-medium',
      notificationItem: 'border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
      unreadItem: 'bg-blue-50 dark:bg-blue-900/20',
      notificationButton: 'p-4 text-left w-full',
      notificationText: 'text-sm dark:text-white',
      notificationTime: 'text-xs text-gray-500 dark:text-gray-400 mt-1',
      emptyState: 'p-4 text-center text-gray-500 dark:text-gray-400',
      loadingState: 'p-4 text-center text-gray-500 dark:text-gray-400',
      errorState: 'p-4 text-center text-red-500 dark:text-red-400'
    };
  };
  
  const styles = getThemeStyles();

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Image src={Bell} alt="Bell" width={20} height={20} className="dark:invert" />
        {totalUnreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownContainer}>
          <div className={styles.header}>
            <h3 className={styles.headerTitle}>Notifications</h3>
            {((activeTab === 'user' && userNotifications.filter(n => !n.isRead).length > 0) || 
              (activeTab === 'owner' && ownerNotifications.filter(n => !n.isRead).length > 0)) && (
              <button
                onClick={handleMarkAllAsRead}
                className={styles.markAllBtn}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabBase} ${
                activeTab === 'user' 
                  ? styles.activeTab
                  : styles.inactiveTab
              }`}
              onClick={() => setActiveTab('user')}
            >
              User
              {unreadUserCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadUserCount}
                </span>
              )}
            </button>
            <button
              className={`${styles.tabBase} ${
                activeTab === 'owner' 
                  ? styles.activeTab
                  : styles.inactiveTab
              }`}
              onClick={() => setActiveTab('owner')}
            >
              Owner
              {unreadOwnerCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadOwnerCount}
                </span>
              )}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className={styles.loadingState}>Loading...</div>
            ) : error ? (
              <div className={styles.errorState}>{error}</div>
            ) : activeTab === 'user' ? (
              userNotifications.length > 0 ? (
                <ul>
                  {userNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`${styles.notificationItem} ${
                        !notification.isRead ? styles.unreadItem : ''
                      }`}
                    >
                      <button
                        onClick={() => handleNotificationClick(notification.id)}
                        className={styles.notificationButton}
                      >
                        <p className={styles.notificationText}>{notification.message}</p>
                        <p className={styles.notificationTime}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyState}>No user notifications</div>
              )
            ) : (
              ownerNotifications.length > 0 ? (
                <ul>
                  {ownerNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`${styles.notificationItem} ${
                        !notification.isRead ? styles.unreadItem : ''
                      }`}
                    >
                      <button
                        onClick={() => handleNotificationClick(notification.id)}
                        className={styles.notificationButton}
                      >
                        <p className={styles.notificationText}>
                          {formatBookingDetails(notification)}
                        </p>
                        <p className={styles.notificationTime}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyState}>No owner notifications</div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;