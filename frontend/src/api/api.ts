import apiClient from "./ApiClient";



export async function getAllianceContactTokens() {
    const { data, error } = await apiClient.GET("/contacts/api/alliance/tokens/");
    if (error) {
        console.error("Error fetching alliance contact tokens: ", error);
        throw error;
    }
    return data;
}

export async function getCorporationContactTokens() {
    const { data, error } = await apiClient.GET("/contacts/api/corporation/tokens/");
    if (error) {
        console.error("Error fetching corporation contact tokens: ", error);
        throw error;
    }
    return data;
}