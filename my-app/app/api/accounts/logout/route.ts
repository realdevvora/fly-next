import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const response = NextResponse.json(
            {
                "message": "User logged out successfully",
                "accessToken": null,
                "refreshToken": null
            },
            {status: 200}
        );

        response.cookies.set("accessToken", "");
        response.cookies.set("refreshToken", "");
        
        return response;
    } catch (error) {
        return NextResponse.json(
            {
                "message": "An error occurred",
                "error": (error as Error).message
            },
            {status: 500}
        );
    }
}