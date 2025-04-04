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
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">No room types found for this hotel.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Room Availability</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booked Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Rooms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((room, index) => {
                const availabilityPercentage = (room.availableRooms / room.totalRooms) * 100;
                let statusColor = 'text-green-600';
                
                if (availabilityPercentage < 20) {
                  statusColor = 'text-red-600';
                } else if (availabilityPercentage < 50) {
                  statusColor = 'text-yellow-600';
                }

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.roomType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.totalRooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.bookedRooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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