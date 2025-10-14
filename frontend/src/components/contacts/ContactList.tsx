import { useParams } from "react-router";
import { Col, Container, Row } from "react-bootstrap";

import ContactTable from "./ContactTable";
import { AllianceHeader, CorporationHeader } from "./ContactListHeader";

interface ContactListProps {
    entityType: "Corporation" | "Alliance";
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
