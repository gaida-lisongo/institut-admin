class SectionService {
    private baseUrl: string;

    constructor() {
        // Utilise les API routes locales au lieu du serveur externe
        this.baseUrl = '/api';
    }

    private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return { data, status: response.status };
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }

    async getAllSections(): Promise<any> {
        const url = `${this.baseUrl}/section`;
        const response = this.makeRequest(url);
        return response;
    }

    async getSectionById(id: string): Promise<any> {
        const url = `${this.baseUrl}/section?id=${encodeURIComponent(id)}`;
        return this.makeRequest(url);
    }

    async getSectionByName(name: string): Promise<any> {
        const url = `${this.baseUrl}/section?name=${encodeURIComponent(name)}`;
        return this.makeRequest(url);
    }

    async searchSections(params: { page?: number; limit?: number; search?: string }): Promise<any> {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);

        const url = `${this.baseUrl}/section?${searchParams.toString()}`;
        return this.makeRequest(url);
    }

    async createSection(sectionData: any): Promise<any> {
        const url = `${this.baseUrl}/section`;
        return this.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(sectionData),
        });
    }

    async updateSection(id: string, sectionData: any): Promise<any> {
        const url = `${this.baseUrl}/section`;
        return this.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify({ id, ...sectionData }),
        });
    }

    async deleteSection(id: string): Promise<any> {
        const url = `${this.baseUrl}/section?id=${encodeURIComponent(id)}`;
        return this.makeRequest(url, {
            method: 'DELETE',
        });
    }
}

export default new SectionService();