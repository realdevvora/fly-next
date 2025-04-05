'use client';

import React from 'react';

interface HotelAvailability {
  roomType: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
}

interface HotelAvailabilityResultsProps {
  results: HotelAvailability[];
  hotelId: string;
  startDate: string;
  endDate: string;
}

const HotelAvailabilityResults: React.FC<HotelAvailabilityResultsProps> = ({ 
  results, 
  hotelId,
  startDate,
  endDate
}) => {
  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">No room types found for this hotel.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Room Availability</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booked Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Available Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Availability %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((room, index) => {
                const availabilityPercentage = (room.availableRooms / room.totalRooms) * 100;
                let statusColor = 'text-green-600';
                
                if (availabilityPercentage < 20) {
                  statusColor = 'text-red-600';
                } else if (availabilityPercentage < 50) {
                  statusColor = 'text-yellow-600';
                }

                return (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {room.roomType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {room.totalRooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {room.bookedRooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {room.availableRooms}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${statusColor}`}>
                      {availabilityPercentage.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HotelAvailabilityResults;
