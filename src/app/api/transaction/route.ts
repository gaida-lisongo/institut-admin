import { NextResponse, NextRequest } from 'next/server';

const SERVER_API_URL = 'https://server-gr.he-section.site/api/v1';

class TransactionApiHandler {

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('auth-token');
        return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }

    private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
        try {
            const response = await fetch(url, {
                headers: {
                    ...this.getAuthHeaders(),
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