const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const uploadFile = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/fichier`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Erreur lors du téléchargement du fichier');
        }

        const request = await response.json();
        const { data } = request;
        console.log("Result data: ", data);
        return data?.publicUrl;
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error);
        throw error;
    }
};
