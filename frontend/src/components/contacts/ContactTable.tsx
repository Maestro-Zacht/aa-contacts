import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, Badge, Image } from "react-bootstrap";
import type { Api as DTApi } from 'datatables.net-bs5';
import type { DataTableRef } from "datatables.net-react";

import Loading from "../Loading";
import DataTable from "../DataTableBase";
import type { components } from "../../api/Schema";

import { getAllianceContacts, getCorporationContacts } from "../../api/api";
import { useEffect, useRef, useState } from "react";


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
];

export default function ContactTable({ entityType }: ContactTableProps) {
    const params = useParams();
    const entityId = parseInt(params[entityType === "Corporation" ? "corporationId" : "allianceId"] || "unknown");
    const tableRef = useRef<DataTableRef>(null);
    const [imagesLoaded, setImagesLoaded] = useState(0);

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

        const columnVisible = !(contacts[0].notes === undefined || contacts[0].notes === null);

        if (columnVisible != e.dt.column(4).visible()) {
            console.debug(`Notes column visibility toggled from ${e.dt.column(4).visible()} to ${columnVisible}`);
            e.dt.column(4).visible(columnVisible);
        }
    }

    const renderLabels = (data: components["schemas"]["ContactLabelSchema"][], type: string, _: any) => {
        if (type !== 'display') {
            return data.sort((a, b) => a.label_name.localeCompare(b.label_name))
                .map(label => label.label_name).join(", ");
        }
        return <>
            {data.map(
                label => (
                    <Badge bg="secondary" key={label.label_name} className="me-1">
                        {label.label_name}
                    </Badge>
                )
            )}
        </>
    }

    const renderContactName = (data: string, type: string, row: components["schemas"]["ContactSchema"]) => {
        if (type !== 'display') return data;
        return <>
            <Image
                src={`${row.contact_logo_url}?size=32`}
                alt={data} className="me-2" rounded
                onLoad={() => setImagesLoaded((prev) => prev + 1)}
            />
            {data}
        </>
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
                    <div className="table-responsive p-3">
                        <DataTable
                            columns={columns} data={contacts}
                            className="table table-aa w-100"
                            onPreDraw={handleNotesColumnVisibility}
                            slots={{
                                0: renderContactName,
                                2: renderLabels
                            }}
                            ref={tableRef}
                        >
                            <thead>
                                <tr>
                                    <th>Contact</th>
                                    <th>Contact Type</th>
                                    <th>Labels</th>
                                    <th>Standings</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                        </DataTable>
                    </div>
                }
            </Card.Body>
        </Card >
    </>
}