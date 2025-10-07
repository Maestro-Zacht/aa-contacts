import apiClient from "./ApiClient";


export async function getAllianceContactTokens() {
    const { data, error } = await apiClient.GET("/contacts/api/alliances/tokens/");
    if (error) {
        console.error("Error fetching alliance contact tokens: ", error);
        throw error;
    }
    return data;
}

export async function getCorporationContactTokens() {
    const { data, error } = await apiClient.GET("/contacts/api/corporations/tokens/");
    if (error) {
        console.error("Error fetching corporation contact tokens: ", error);
        throw error;
    }
    return data;
}

export async function getAllianceContacts(allianceId: number) {
    const { data, error } = await apiClient.GET(
        "/contacts/api/alliances/{alliance_id}/contacts/",
        { params: { path: { alliance_id: allianceId } } }
    );
    if (error) {
        console.error("Error fetching alliance contacts: ", error);
        throw error;
    }
    return data;
}

export async function getCorporationContacts(corporationId: number) {
    const { data, error } = await apiClient.GET(
        "/contacts/api/corporations/{corporation_id}/contacts/",
        { params: { path: { corporation_id: corporationId } } }
    );
    if (error) {
        console.error("Error fetching corporation contacts: ", error);
        throw error;
    }
    return data;
}

export async function getAllianceToken(allianceId: number) {
    const { data, error } = await apiClient.GET(
        "/contacts/api/alliances/tokens/{alliance_id}/",
        { params: { path: { alliance_id: allianceId } } }
    );
    if (error) {
        console.error("Error fetching alliance token: ", error);
        throw error;
    }
    return data;
}

export async function getCorporationToken(corporationId: number) {
    const { data, error } = await apiClient.GET(
        "/contacts/api/corporations/tokens/{corporation_id}/",
        { params: { path: { corporation_id: corporationId } } }
    );
    if (error) {
        console.error("Error fetching corporation token: ", error);
        throw error;
    }
    return data;
}
