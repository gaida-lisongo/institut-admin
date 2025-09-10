import { NextRequest, NextResponse } from 'next/server';

const SERVER_API_URL = 'https://legendary-barnacle-7v54v7x64jgxcpwvg-3000.app.github.dev/api/v1';

class SectionApiHandler {
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

    async handleGet(request: NextRequest): Promise<NextResponse> {
        try {
            const { searchParams } = new URL(request.url);
            const id = searchParams.get('id');
            const name = searchParams.get('name');
            const search = searchParams.get('search');

            let url = `${SERVER_API_URL}/section`;

            if (search) {
                url += `/search?${searchParams.toString()}`;
            } else if (name) {
                url += `/name/${encodeURIComponent(name)}`;
            } else if (id) {
                url += `/${id}`;
            } else if (searchParams.toString()) {
                url += `?${searchParams.toString()}`;
            }

            const response = await this.makeRequest(url);
            
            const resp = await response.json();
            
            return NextResponse.json(resp, { status: response.status });
        } catch (error) {
            console.error('Error in GET /api/sections:', error);
            return this.createErrorResponse('Erreur lors de la récupération', 500);
        }
    }

    async handlePost(request: NextRequest): Promise<NextResponse> {
        try {
            const body = await request.json();
            
            const response = await this.makeRequest(`${SERVER_API_URL}/section`, {
                method: 'POST',
                body: JSON.stringify(body),
            });

            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        } catch (error) {
            console.error('Error in POST /api/sections:', error);
            return this.createErrorResponse('Erreur lors de la création', 500);
        }
    }

    async handlePut(request: NextRequest): Promise<NextResponse> {
        try {
            const body = await request.json();
            const { id, ...updateData } = body;

            if (!id) {
                return this.createErrorResponse('ID manquant', 400);
            }

            const response = await this.makeRequest(`${SERVER_API_URL}/section/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        } catch (error) {
            console.error('Error in PUT /api/sections:', error);
            return this.createErrorResponse('Erreur lors de la mise à jour', 500);
        }
    }

    async handleDelete(request: NextRequest): Promise<NextResponse> {
        try {
            const { searchParams } = new URL(request.url);
            const id = searchParams.get('id');

            if (!id) {
                return this.createErrorResponse('ID manquant', 400);
            }

            const response = await this.makeRequest(`${SERVER_API_URL}/section/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        } catch (error) {
            console.error('Error in DELETE /api/sections:', error);
            return this.createErrorResponse('Erreur lors de la suppression', 500);
        }
    }
}

const sectionHandler = new SectionApiHandler();

export async function GET(request: NextRequest) {
    return sectionHandler.handleGet(request);
}

export async function POST(request: NextRequest) {
    return sectionHandler.handlePost(request);
}

export async function PUT(request: NextRequest) {
    return sectionHandler.handlePut(request);
}

export async function DELETE(request: NextRequest) {
    return sectionHandler.handleDelete(request);
}