import apiClient from "./ApiClient";
import type { components } from "./Schema";

type ServerLinkInputSchema = components["schemas"]["ServerLinkInputSchema"];


export async function getUserPermission() {
    const { data, error } = await apiClient.GET("/contacts/api/permissions/me");
    if (error) {
        console.error("Error fetching user permissions: ", error);
        throw error;
    }
    return data;
}

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

export async function updateAllianceContacts(allianceId: number) {
    const { error } = await apiClient.POST(
        "/contacts/api/alliances/{alliance_id}/contacts/update",
        { params: { path: { alliance_id: allianceId } } }
    );
    if (error) {
        console.error("Error updating alliance contacts: ", error);
        throw error;
    }
}

export async function updateCorporationContacts(corporationId: number) {
    const { error } = await apiClient.POST(
        "/contacts/api/corporations/{corporation_id}/contacts/update",
        { params: { path: { corporation_id: corporationId } } }
    );
    if (error) {
        console.error("Error updating corporation contacts: ", error);
        throw error;
    }
}

export async function saveAllianceContactNotes(allianceId: number, contactPk: number, notes: string) {
    const { error } = await apiClient.PATCH(
        "/contacts/api/alliances/{alliance_id}/contacts/{contact_pk}",
        {
            params: { path: { alliance_id: allianceId, contact_pk: contactPk } },
            body: { notes: notes }
        }
    )
    if (error) {
        console.error("Error saving alliance contact notes: ", error);
        throw error;
    }
}

export async function saveCorporationContactNotes(corporationId: number, contactPk: number, notes: string) {
    const { error } = await apiClient.PATCH(
        "/contacts/api/corporations/{corporation_id}/contacts/{contact_pk}",
        {
            params: { path: { corporation_id: corporationId, contact_pk: contactPk } },
            body: { notes: notes }
        }
    )
    if (error) {
        console.error("Error saving corporation contact notes: ", error);
        throw error;
    }
}

export async function createAllianceServerLink(allianceId: number, contactPk: number, body: ServerLinkInputSchema) {
    const { data, error } = await apiClient.POST(
        "/contacts/api/alliances/{alliance_id}/contacts/{contact_pk}/server-links",
        {
            params: { path: { alliance_id: allianceId, contact_pk: contactPk } },
            body
        }
    );
    if (error) {
        console.error("Error creating alliance server link: ", error);
        throw error;
    }
    return data;
}

export async function updateAllianceServerLink(allianceId: number, contactPk: number, linkPk: number, body: ServerLinkInputSchema) {
    const { data, error } = await apiClient.PUT(
        "/contacts/api/alliances/{alliance_id}/contacts/{contact_pk}/server-links/{link_pk}",
        {
            params: { path: { alliance_id: allianceId, contact_pk: contactPk, link_pk: linkPk } },
            body
        }
    );
    if (error) {
        console.error("Error updating alliance server link: ", error);
        throw error;
    }
    return data;
}

export async function deleteAllianceServerLink(allianceId: number, contactPk: number, linkPk: number) {
    const { error } = await apiClient.DELETE(
        "/contacts/api/alliances/{alliance_id}/contacts/{contact_pk}/server-links/{link_pk}",
        {
            params: { path: { alliance_id: allianceId, contact_pk: contactPk, link_pk: linkPk } }
        }
    );
    if (error) {
        console.error("Error deleting alliance server link: ", error);
        throw error;
    }
}

export async function createCorporationServerLink(corporationId: number, contactPk: number, body: ServerLinkInputSchema) {
    const { data, error } = await apiClient.POST(
        "/contacts/api/corporations/{corporation_id}/contacts/{contact_pk}/server-links",
        {
            params: { path: { corporation_id: corporationId, contact_pk: contactPk } },
            body
        }
    );
    if (error) {
        console.error("Error creating corporation server link: ", error);
        throw error;
    }
    return data;
}

export async function updateCorporationServerLink(corporationId: number, contactPk: number, linkPk: number, body: ServerLinkInputSchema) {
    const { data, error } = await apiClient.PUT(
        "/contacts/api/corporations/{corporation_id}/contacts/{contact_pk}/server-links/{link_pk}",
        {
            params: { path: { corporation_id: corporationId, contact_pk: contactPk, link_pk: linkPk } },
            body
        }
    );
    if (error) {
        console.error("Error updating corporation server link: ", error);
        throw error;
    }
    return data;
}

export async function deleteCorporationServerLink(corporationId: number, contactPk: number, linkPk: number) {
    const { error } = await apiClient.DELETE(
        "/contacts/api/corporations/{corporation_id}/contacts/{contact_pk}/server-links/{link_pk}",
        {
            params: { path: { corporation_id: corporationId, contact_pk: contactPk, link_pk: linkPk } }
        }
    );
    if (error) {
        console.error("Error deleting corporation server link: ", error);
        throw error;
    }
}
