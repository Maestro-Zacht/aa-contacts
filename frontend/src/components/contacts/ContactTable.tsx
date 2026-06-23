import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Badge, Image } from "react-bootstrap";
import type { Api as DTApi } from 'datatables.net-bs5';
import type { DataTableRef } from "datatables.net-react";

import Loading from "../Loading";
import DataTable from "../tables/DataTableBase";
import type { components } from "../../api/Schema";

import {
    getAllianceContacts, getCorporationContacts,
    saveAllianceContactNotes, saveCorporationContactNotes,
    createAllianceServerLink, updateAllianceServerLink, deleteAllianceServerLink,
    createCorporationServerLink, updateCorporationServerLink, deleteCorporationServerLink,
} from "../../api/api";
import { useEffect, useRef, useState } from "react";
import ContactNotesModal from "./ContactNotesModal";
import ServerLinkModal from "./ServerLinkModal";
import { useTranslation } from "react-i18next";

type ServerLinkInputSchema = components["schemas"]["ServerLinkInputSchema"];
type ContactSchema = components["schemas"]["ContactSchema"];

interface ContactTableProps {
    entityType: "Corporation" | "Alliance";
}

const emptyContacts: never[] = [];

const columns = [
    { data: 'contact_name' },
    { data: 'contact_type' },
    { data: 'labels' },
    { data: 'standing' },
    { data: 'server_links', visible: false, orderable: false },
    { data: 'notes', visible: false },
    { data: 'can_edit_notes', visible: false, orderable: false, searchable: false }
];

export default function ContactTable({ entityType }: ContactTableProps) {
    const { t } = useTranslation();
    const params = useParams();
    const entityId = parseInt(params[entityType === "Corporation" ? "corporationId" : "allianceId"] || "unknown");
    const tableRef = useRef<DataTableRef>(null);
    const [imagesLoaded, setImagesLoaded] = useState(0);

    const queryClient = useQueryClient();

    const invalidateQueries = async () => {
        await queryClient.invalidateQueries({ queryKey: [entityType.toLowerCase(), entityId, 'contacts'] });
    }

    const notesMutation = useMutation({
        mutationFn: ({ newNotes, contactPk }: { newNotes: string, contactPk: number }) => {
            return entityType === "Corporation" ?
                saveCorporationContactNotes(entityId, contactPk, newNotes) :
                saveAllianceContactNotes(entityId, contactPk, newNotes);
        },
        onSuccess: async () => {
            await invalidateQueries();
        },
        onError: async () => {
            await invalidateQueries();
        }
    });

    const createServerLinkMutation = useMutation({
        mutationFn: ({ contactPk, body }: { contactPk: number, body: ServerLinkInputSchema }) => {
            return entityType === "Corporation" ?
                createCorporationServerLink(entityId, contactPk, body) :
                createAllianceServerLink(entityId, contactPk, body);
        },
        onSuccess: async () => {
            await invalidateQueries();
        },
        onError: async () => {
            await invalidateQueries();
        }
    });

    const updateServerLinkMutation = useMutation({
        mutationFn: ({ contactPk, linkPk, body }: { contactPk: number, linkPk: number, body: ServerLinkInputSchema }) => {
            return entityType === "Corporation" ?
                updateCorporationServerLink(entityId, contactPk, linkPk, body) :
                updateAllianceServerLink(entityId, contactPk, linkPk, body);
        },
        onSuccess: async () => {
            await invalidateQueries();
        },
        onError: async () => {
            await invalidateQueries();
        }
    });

    const deleteServerLinkMutation = useMutation({
        mutationFn: ({ contactPk, linkPk }: { contactPk: number, linkPk: number }) => {
            return entityType === "Corporation" ?
                deleteCorporationServerLink(entityId, contactPk, linkPk) :
                deleteAllianceServerLink(entityId, contactPk, linkPk);
        },
        onSuccess: async () => {
            await invalidateQueries();
        },
        onError: async () => {
            await invalidateQueries();
        }
    });

    const { data, isLoading, error } = useQuery({
        queryKey: [entityType.toLowerCase(), entityId, 'contacts'],
        queryFn: entityType === "Corporation" ?
            () => getCorporationContacts(entityId) :
            () => getAllianceContacts(entityId),
    });

    const contacts = data || emptyContacts;

    useEffect(() => {
        if (imagesLoaded > 0 && imagesLoaded >= contacts.length) {
            tableRef.current?.dt()?.columns.adjust();
        }
    }, [imagesLoaded, contacts]);

    if (error) {
        console.error(error);
        return <p>{t("contact.loading.error")}</p>;
    }

    const handleColumnVisibility = (e: { dt: DTApi }) => {
        if (contacts.length === 0) return;

        const notesColumnVisible = !(contacts[0].notes === undefined || contacts[0].notes === null);
        const editColumnVisible = contacts[0].can_edit_notes && notesColumnVisible;

        if (notesColumnVisible != e.dt.column(5).visible()) {
            console.debug(`Notes column visibility toggled from ${e.dt.column(5).visible()} to ${notesColumnVisible}`);
            e.dt.column(5).visible(notesColumnVisible);
        }

        if (editColumnVisible != e.dt.column(6).visible()) {
            console.debug(`Edit Notes column visibility toggled from ${e.dt.column(6).visible()} to ${editColumnVisible}`);
            e.dt.column(6).visible(editColumnVisible);
        }

        const serverLinksVisible = contacts[0].can_view_server_links;
        if (serverLinksVisible != e.dt.column(4).visible()) {
            console.debug(`Server Links column visibility toggled from ${e.dt.column(4).visible()} to ${serverLinksVisible}`);
            e.dt.column(4).visible(serverLinksVisible);
        }
    }

    const renderLabels = (data: components["schemas"]["ContactLabelSchema"][], type: string, _: ContactSchema) => {
        data.sort((a, b) => a.label_name.localeCompare(b.label_name));
        switch (type) {
            case 'display':
                return <>
                    {data.map(
                        label => (
                            <Badge bg="secondary" key={label.label_name} className="me-1">
                                {label.label_name}
                            </Badge>
                        )
                    )}
                </>
            default:
                return data.map(label => label.label_name).join(", ");
        }
    }

    const renderContactName = (data: string, type: string, row: ContactSchema) => {
        switch (type) {
            case 'display':
                return <>
                    <Image
                        src={`${row.contact_logo_url}?size=32`}
                        alt={data} className="me-2" rounded
                        onLoad={() => setImagesLoaded((prev) => prev + 1)}
                    />
                    {data}
                </>
            default:
                return data;
        }
    }

    const renderEditNotes = (data: boolean, type: string, row: ContactSchema) => {
        switch (type) {
            case 'display':
                // console.log(data);
                return <>
                    {data && <ContactNotesModal
                        initialNotes={row.notes || ""}
                        contactPk={row.id}
                        mutation={notesMutation}
                    />}
                </>
            default:
                return data;
        }
    }

    const renderServerLinks = (data: components["schemas"]["ServerLinkSchema"][], type: string, row: ContactSchema) => {
        switch (type) {
            case 'display':
                if (!row.can_view_server_links && !row.can_manage_server_links) return null;
                return <>
                    {data.map(link => (
                        <ServerLinkModal
                            key={link.id}
                            link={link}
                            contactPk={row.id}
                            canManage={row.can_manage_server_links}
                            createMutation={createServerLinkMutation}
                            updateMutation={updateServerLinkMutation}
                            deleteMutation={deleteServerLinkMutation}
                        />
                    ))}
                    {row.can_manage_server_links && <ServerLinkModal
                        contactPk={row.id}
                        canManage={row.can_manage_server_links}
                        createMutation={createServerLinkMutation}
                        updateMutation={updateServerLinkMutation}
                        deleteMutation={deleteServerLinkMutation}
                    />}
                </>
            default:
                return data.map(link => link.name).join(", ");
        }
    }

    return <>
        <Card>
            <Card.Body>
                {isLoading ?
                    <Loading /> :
                    <DataTable
                        columns={columns} data={contacts}
                        className="table table-aa"
                        onPreDraw={handleColumnVisibility}
                        slots={{
                            0: renderContactName,
                            2: renderLabels,
                            4: renderServerLinks,
                            6: renderEditNotes,
                        }}
                        ref={tableRef}
                        options={{
                            pageLength: 50,
                            columnDefs: [
                                {
                                    targets: [1, 2, 3],
                                    columnControl: [
                                        {
                                            target: 'thead:0',
                                            className: 'dtcc-row_no-bottom-border',
                                            content: [
                                                'orderStatus',
                                                ['orderAddAsc', 'orderAddDesc', 'orderRemove', 'orderClear'],
                                                {
                                                    extend: 'dropdown',
                                                    text: t('search'),
                                                    icon: 'search',
                                                    content: [
                                                        {
                                                            extend: 'searchList',
                                                            orthogonal: 'filter',
                                                        },
                                                    ],
                                                }
                                            ],
                                        },
                                        {
                                            target: 'thead:1',
                                            className: 'dtcc-row_no-top-padding',
                                            content: [],
                                        }
                                    ],
                                },
                                {
                                    targets: [4, 6],
                                    className: 'text-center',
                                    columnControl: [
                                        {
                                            target: 'thead:0',
                                            className: 'dtcc-row_no-bottom-border',
                                            content: [],
                                        },
                                        {
                                            target: 'thead:1',
                                            className: 'dtcc-row_no-top-padding',
                                            content: [],
                                        }
                                    ],
                                },
                            ],
                            columnControl: [
                                {
                                    target: 'thead:0',
                                    className: 'dtcc-row_no-bottom-border',
                                    content: [
                                        'orderStatus',
                                        ['orderAddAsc', 'orderAddDesc', 'orderRemove', 'orderClear']
                                    ],
                                },
                                {
                                    target: 'thead:1',
                                    className: 'dtcc-row_no-top-padding',
                                    content: ['search'],
                                },
                            ],
                            ordering: {
                                indicators: false,
                            },
                            scrollX: true,
                        }}
                    >
                        <thead>
                            <tr>
                                <th>{t('contact.word', { count: 1 })}</th>
                                <th>{t('contact.type')}</th>
                                <th>{t('label.word', { count: 2 })}</th>
                                <th>{t('standings')}</th>
                                <th>{t('server_link.word', { count: 2 })}</th>
                                <th>{t('notes')}</th>
                                <th></th>
                            </tr>
                        </thead>
                    </DataTable>
                }
            </Card.Body>
        </Card >
    </>
}
