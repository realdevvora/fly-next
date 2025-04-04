import { NextRequest, NextResponse } from 'next/server';

interface Airport {
    name: string;
    city: string;
    code: string;
    country: string;
}

interface Flight {
    id: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    price: number;
    stops: number;
    availableSeats: number;
    departureAirportCode: string;
    arrivalAirportCode: string;
}

interface FlightResult {
    results: Flight[];
}

interface FlightPreferences {
    maxPrice: number;
    maxDuration: number;
    preferredAirlines: string[];
}

// Enhanced scoring function for flight selection
function scoreFlight(flight: Flight, preferenceWeights: FlightPreferences): number {
    let score = 0;

    // Price scoring (lower is better)
    if (flight.price <= preferenceWeights.maxPrice) {
        score += (preferenceWeights.maxPrice - flight.price) / preferenceWeights.maxPrice * 30;
    }

    // Duration scoring (shorter is better)
    const maxAcceptableDuration = preferenceWeights.maxDuration;
    if (flight.duration <= maxAcceptableDuration) {
        score += (maxAcceptableDuration - flight.duration) / maxAcceptableDuration * 25;
    }

    // Stops scoring (fewer stops is better)
    score += Math.max(0, (3 - flight.stops) * 15);

    // Available seats scoring
    score += Math.min(flight.availableSeats / 10, 15);

    // Preferred airlines bonus
    if (preferenceWeights.preferredAirlines.includes(flight.airline)) {
        score += 15;
    }

    return score;
}

// Helper function for finding best flight
function selectBestFlight(flights: Flight[], preferences: FlightPreferences): Flight | null {
    if (!flights || flights.length === 0) return null;

    // If only one flight, return it
    if (flights.length === 1) return flights[0];

    // Score and sort flights
    const scoredFlights = flights
        .map(flight => ({
            flight,
            score: scoreFlight(flight, preferences)
        }))
        .sort((a, b) => b.score - a.score);

    // Return top flight
    return scoredFlights[0].flight;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters with defaults
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const departDate = searchParams.get('departDate');
    const returnDate = searchParams.get('returnDate');
    
    // User preferences
    const userPreferences: FlightPreferences = {
        maxPrice: Number(searchParams.get('maxPrice') || 1000),
        maxDuration: Number(searchParams.get('maxDuration') || 720), // 12 hours
        preferredAirlines: (searchParams.get('preferredAirlines') || '').split(',').filter(Boolean)
    };

    // Validate required parameters
    if (!source || !destination) {
        return NextResponse.json({ 
            error: "Source and destination are required.",
            suggestedParams: {
                requiredParams: ['source', 'destination'],
                optionalParams: ['departDate', 'returnDate', 'maxPrice', 'maxDuration', 'preferredAirlines']
            }
        }, { status: 400 });
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FLIGHT_API_KEY || ''
    };

    try {
        // Fetch airports first to validate source and destination
        const airportsResponse = await fetch('https://advanced-flights-system.replit.app/api/airports', { headers });
        const airports: Airport[] = await airportsResponse.json();

        // Find matching airports
        const sourceAirport = airports.find(airport => 
            airport.code.toLowerCase() === source.toLowerCase() ||
            airport.city.toLowerCase() === source.toLowerCase() ||
            airport.name.toLowerCase() === source.toLowerCase()
        );

        const destAirport = airports.find(airport => 
            airport.code.toLowerCase() === destination.toLowerCase() ||
            airport.city.toLowerCase() === destination.toLowerCase() ||
            airport.name.toLowerCase() === destination.toLowerCase()
        );

        if (!sourceAirport || !destAirport) {
            return NextResponse.json({ 
                error: 'No matching airports found',
                suggestedAirports: airports.slice(0, 5)
            }, { status: 404 });
        }

        // Fetch flights using the API
        const outboundFlights: FlightResult = departDate 
            ? await (await fetch(`https://advanced-flights-system.replit.app/api/flights?origin=${sourceAirport.code}&destination=${destAirport.code}&date=${departDate}`, { headers })).json()
            : { results: [] };

        const returnFlights: FlightResult = (returnDate && departDate)
            ? await (await fetch(`https://advanced-flights-system.replit.app/api/flights?origin=${destAirport.code}&destination=${sourceAirport.code}&date=${returnDate}`, { headers })).json()
            : { results: [] };

        // Select best flights
        const bestOutboundFlight = selectBestFlight(outboundFlights.results, userPreferences);
        const bestReturnFlight = selectBestFlight(returnFlights.results, userPreferences);

        return NextResponse.json({
            bestOutboundFlight,
            bestReturnFlight,
            isRoundTrip: !!returnDate,
            userPreferences,
            airports: {
                source: sourceAirport,
                destination: destAirport
            }
        });

    } catch (error) {
        console.error('Flight search error:', error);
        return NextResponse.json({ 
            error: "An error occurred while searching for flights.", 
            details: String(error) 
        }, { status: 500 });
    }
}

// Autocomplete airports endpoint
export async function POST(request: NextRequest) {
    const { query } = await request.json();

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.FLIGHT_API_KEY || ''
    };

    try {
        const airportsResponse = await fetch('https://advanced-flights-system.replit.app/api/airports', { headers });
        const airports: Airport[] = await airportsResponse.json();

        const matchingAirports = airports.filter(airport => 
            airport.city.toLowerCase().includes(query.toLowerCase()) ||
            airport.name.toLowerCase().includes(query.toLowerCase()) ||
            airport.code.toLowerCase().includes(query.toLowerCase())
        );

        return NextResponse.json({ 
            airports: matchingAirports.slice(0, 5) 
        });
    } catch (error) {
        console.error('Airport search error:', error);
        return NextResponse.json({ 
            error: "An error occurred while searching for airports.", 
            details: String(error) 
        }, { status: 500 });
    }
}