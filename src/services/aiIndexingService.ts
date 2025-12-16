/**
 * AI Indexing Service
 * Handles communication with the AI indexing API endpoint
 */

export interface AIIndexingRequest {
    base_64: string;
}

export interface AIIndexingResponse {
    processed_base64: string;
}

const API_ENDPOINT = 'http://16.16.197.117:5050/get_ai_indexing_processed';

/**
 * Convert a File object to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Convert base64 string to downloadable Blob
 */
export const base64ToBlob = (base64: string, mimeType: string = 'application/pdf'): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Process PDF document using AI indexing API
 */
export const processDocument = async (file: File): Promise<AIIndexingResponse> => {
    try {
        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Prepare request payload
        const payload: AIIndexingRequest = {
            base_64: base64,
        };

        // Make API request
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Parse response
        const data: AIIndexingResponse = await response.json();

        if (!data.processed_base64) {
            throw new Error('Invalid API response: missing processed_base64');
        }

        return data;
    } catch (error) {
        console.error('AI Indexing API Error:', error);
        throw error;
    }
};

/**
 * Download processed document
 */
export const downloadProcessedDocument = (
    processedBase64: string,
    filename: string
): void => {
    const blob = base64ToBlob(processedBase64);
    downloadBlob(blob, filename);
};

/**
 * Download original document
 */
export const downloadOriginalDocument = (
    originalBase64: string,
    filename: string
): void => {
    const blob = base64ToBlob(originalBase64);
    downloadBlob(blob, filename);
};
