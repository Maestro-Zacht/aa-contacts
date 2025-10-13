import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Badge, Image } from "react-bootstrap";
import type { Api as DTApi } from 'datatables.net-bs5';
import type { DataTableRef } from "datatables.net-react";

import Loading from "../Loading";
import DataTable from "../tables/DataTableBase";
import type { components } from "../../api/Schema";

import { getAllianceContacts, getCorporationContacts, saveAllianceContactNotes, saveCorporationContactNotes } from "../../api/api";
import { useEffect, useRef, useState } from "react";
import ContactNotesModal from "./ContactNotesModal";


interface ContactTableProps {
    entityType: "Corporation" | "Alliance";
}

const emptyContacts: never[] = [];

const columns = [
    { data: 'contact_name' },
    { data: 'contact_type' },
    { data: 'labels' },
    { data: 'standing' },
    { data: 'notes', visible: false },
    { data: 'can_edit_notes', visible: false, orderable: false, searchable: false }
];

export default function ContactTable({ entityType }: ContactTableProps) {
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

    const { data, isLoading, error } = useQuery({
        queryKey: [entityType.toLowerCase(), entityId, 'contacts'],
        queryFn: entityType === "Corporation" ?
            () => getCorporationContacts(entityId) :
            () => getAllianceContacts(entityId),
    });

    if (error) {
        console.error(error);
        return <p>Error loading contacts. Contact administrators</p>;
    }

    const contacts = data || emptyContacts;

    const handleNotesColumnVisibility = (e: { dt: DTApi }) => {
        if (contacts.length === 0) return;

        const notesColumnVisible = !(contacts[0].notes === undefined || contacts[0].notes === null);
        const editColumnVisible = contacts[0].can_edit_notes && notesColumnVisible;

        if (notesColumnVisible != e.dt.column(4).visible()) {
            console.debug(`Notes column visibility toggled from ${e.dt.column(4).visible()} to ${notesColumnVisible}`);
            e.dt.column(4).visible(notesColumnVisible);
        }

        if (editColumnVisible != e.dt.column(5).visible()) {
            console.debug(`Edit Notes column visibility toggled from ${e.dt.column(5).visible()} to ${editColumnVisible}`);
            e.dt.column(5).visible(editColumnVisible);
        }
    }

    const renderLabels = (data: components["schemas"]["ContactLabelSchema"][], type: string, _: any) => {
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

    const renderContactName = (data: string, type: string, row: components["schemas"]["ContactSchema"]) => {
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

    const renderEditNotes = (data: boolean, type: string, row: components["schemas"]["ContactSchema"]) => {
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

    useEffect(() => {
        if (imagesLoaded > 0 && imagesLoaded >= contacts.length) {
            tableRef.current?.dt()?.columns.adjust();
        }
    }, [imagesLoaded, contacts]);

    return <>
        <Card>
            <Card.Body>
                {isLoading ?
                    <Loading /> :
                    <DataTable
                        columns={columns} data={contacts}
                        className="table table-aa"
                        onPreDraw={handleNotesColumnVisibility}
                        slots={{
                            0: renderContactName,
                            2: renderLabels,
                            5: renderEditNotes,
                        }}
                        ref={tableRef}
                        options={{
                            pageLength: 50,
                            columnDefs: [
                                {
                                    targets: [1, 2],
                                    columnControl: [
                                        {
                                            target: 'thead:0',
                                            className: 'dtcc-row_no-bottom-border',
                                            content: [
                                                'orderStatus',
                                                ['orderAddAsc', 'orderAddDesc', 'orderRemove', 'orderClear'],
                                                {
                                                    extend: 'dropdown',
                                                    text: 'Search',
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
                                    target: 5,
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
                                }
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
                                <th>Contact</th>
                                <th>Contact Type</th>
                                <th>Labels</th>
                                <th>Standings</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>
                        </thead>
                    </DataTable>
                }
            </Card.Body>
        </Card >
    </>
}