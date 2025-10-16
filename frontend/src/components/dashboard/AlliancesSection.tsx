import { useQuery } from "@tanstack/react-query";
import { getAllianceContactTokens } from "../../api/api";
import { Col, Container, Row } from "react-bootstrap";
import Loading from "../Loading";
import TokenPortrait from "./TokenPortrait";


export default function AlliancesSection() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['alliances', 'tokens'],
        queryFn: getAllianceContactTokens,
    });

    if (error) {
        console.error(error);
        return <p>Error loading alliance contact tokens. Contact administrators</p>;
    }

    const allianceTokens = data || [];

    return (
        <Container fluid>
            <Row className='justify-content-center'>
                {isLoading ?
                    <Col xs="auto">
                        <Loading />
                    </Col>
                    :
                    <>
                        {
                            allianceTokens.length > 0 ?
                                allianceTokens.map(token => (
                                    <Col key={token.alliance.alliance_id} xs="auto" className="mx-5">
                                        <TokenPortrait
                                            imgUrl={token.alliance.logo_url}
                                            name={token.alliance.alliance_name}
                                            entityId={token.alliance.alliance_id}
                                            entityType="Alliance"
                                        />
                                    </Col>
                                ))
                                :
                                <Col xs="auto" className="mt-5">
                                    <p>No alliance contact tokens found.</p>
                                </Col>
                        }
                    </>
                }
            </Row>
        </Container>
    );
}