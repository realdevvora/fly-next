import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const headers: HeadersInit = {};
    
    if (process.env.FLIGHT_API_KEY) {
        headers['x-api-key'] = process.env.FLIGHT_API_KEY;
    }

    const response = await fetch('https://advanced-flights-system.replit.app/api/cities', {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}