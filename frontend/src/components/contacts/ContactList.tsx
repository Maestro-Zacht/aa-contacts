import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import TimeAgo from 'react-timeago';

import Loading from "../Loading";
import ContactTable from "./ContactTable";
import { getAllianceToken, getCorporationToken } from "../../api/api";

interface ContactListProps {
    entityType: "Corporation" | "Alliance";
}

function Header({ name, lastUpdate }: { name: string, lastUpdate: string }) {
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
                                <Button className="mt-4">Update</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

function AllianceHeader({ allianceId }: { allianceId: number }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['alliance', 'tokens', allianceId],
        queryFn: () => getAllianceToken(allianceId),
    });

    if (error) {
        console.error(error);
        return <p>Error loading alliance info. Contact administrators</p>;
    }

    return (
        <>
            {isLoading ?
                <Loading /> :
                <Header name={data?.alliance.alliance_name || "Unknown Alliance"} lastUpdate={data?.last_update || "Unknown"} />
            }
        </>
    )
}

function CorporationHeader({ corporationId }: { corporationId: number }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['corporation', 'tokens', corporationId],
        queryFn: () => getCorporationToken(corporationId),
    });

    if (error) {
        console.error(error);
        return <p>Error loading corporation info. Contact administrators</p>;
    }

    return (
        <>
            {isLoading ?
                <Loading /> :
                <Header name={data?.corporation.corporation_name || "Unknown Corporation"} lastUpdate={data?.last_update || "Unknown"} />
            }
        </>
    )
}

export default function ContactList({ entityType }: ContactListProps) {
    const params = useParams();
    const entityId = parseInt(params[entityType === "Corporation" ? "corporationId" : "allianceId"] || "unknown");

    return (
        <>
            {
                entityType === "Alliance" ?
                    <AllianceHeader allianceId={entityId} /> :
                    <CorporationHeader corporationId={entityId} />
            }
            <Container fluid>
                <Row>
                    <Col>
                        <ContactTable entityType={entityType} />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
