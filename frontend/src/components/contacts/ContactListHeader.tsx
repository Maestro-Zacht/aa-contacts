import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import TimeAgo from 'react-timeago';

import Loading from "../Loading";
import {
    getAllianceToken,
    getCorporationToken,
    updateAllianceContacts,
    updateCorporationContacts,
} from "../../api/api";


interface HeaderProps {
    entityId: number;
    name: string;
    lastUpdate: string;
    updateFn: (entityId: number) => Promise<void>;
    invalidateQueries: () => Promise<void>;
}

function Header({ entityId, name, lastUpdate, updateFn, invalidateQueries }: HeaderProps) {
    const mutation = useMutation({
        mutationFn: updateFn,
        onSuccess: async () => {
            await invalidateQueries();
        }
    });

    const handleUpdate = () => {
        mutation.mutate(entityId);
    };

    return (
        <>
            <header className="aa-page-header mb-4">
                <h1 className="page-header text-center">
                    {name} Contacts
                </h1>
            </header>
            <Container fluid>
                <Row className="justify-content-center my-3">
                    <Col md={4}>
                        <Card className="text-center">
                            <Card.Header>Info</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            Last Updated: <Badge className="text-center ms-1" bg="success">
                                                <TimeAgo date={lastUpdate} />
                                            </Badge>
                                        </Card.Text>
                                    </Col>
                                </Row>
                                <Button
                                    variant={mutation.isError ? "danger" : "primary"}
                                    className="mt-4"
                                    onClick={handleUpdate}
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? <Loading /> : mutation.isError ? "Error!" : "Update"}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export function AllianceHeader({ allianceId }: { allianceId: number }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['alliance', 'tokens', allianceId],
        queryFn: () => getAllianceToken(allianceId),
    });

    if (error) {
        console.error(error);
        return <p>Error loading alliance info. Contact administrators</p>;
    }

    const queryClient = useQueryClient();
    const invalidateQueries = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['alliance', allianceId, 'contacts'] }),
            queryClient.invalidateQueries({ queryKey: ['alliance', 'tokens', allianceId] }),
        ]);
    };

    return (
        <>
            {isLoading ?
                <Loading /> :
                <Header
                    entityId={allianceId}
                    name={data?.alliance.alliance_name || "Unknown Alliance"}
                    lastUpdate={data?.last_update || "Unknown"}
                    updateFn={updateAllianceContacts}
                    invalidateQueries={invalidateQueries}
                />
            }
        </>
    )
}

export function CorporationHeader({ corporationId }: { corporationId: number }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['corporation', 'tokens', corporationId],
        queryFn: () => getCorporationToken(corporationId),
    });

    if (error) {
        console.error(error);
        return <p>Error loading corporation info. Contact administrators</p>;
    }

    const queryClient = useQueryClient();
    const invalidateQueries = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['corporation', corporationId, 'contacts'] }),
            queryClient.invalidateQueries({ queryKey: ['corporation', 'tokens', corporationId] }),
        ]);
    };

    return (
        <>
            {isLoading ?
                <Loading /> :
                <Header
                    entityId={corporationId}
                    name={data?.corporation.corporation_name || "Unknown Corporation"}
                    lastUpdate={data?.last_update || "Unknown"}
                    updateFn={updateCorporationContacts}
                    invalidateQueries={invalidateQueries}
                />
            }
        </>
    )
}