import { NextResponse, NextRequest } from 'next/server';

const SERVER_API_URL = 'https://legendary-barnacle-7v54v7x64jgxcpwvg-3000.app.github.dev/api/v1';

class TransactionApiHandler {
    private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            return response;
        } catch (error) {
            console.error('Proxy request error:', error);
            throw error;
        }
    }

    private createErrorResponse(message: string, status: number): NextResponse {
        return NextResponse.json(
            { success: false, message },
            { status }
        );
    }

    
}

const transactionHandler = new TransactionApiHandler();