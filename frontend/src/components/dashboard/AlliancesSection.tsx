import { useQuery } from "@tanstack/react-query";
import { getAllianceContactTokens } from "../../api/api";
import { Col, Container, Row } from "react-bootstrap";
import Loading from "../Loading";
import TokenPortrait from "./TokenPortrait";


export default function AlliancesSection() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['alliance', 'tokens'],
        queryFn: getAllianceContactTokens
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
                            allianceTokens.map(token => (
                                <Col key={token.id} xs="auto" className="mx-5">
                                    <TokenPortrait img_url={token.alliance.logo_url} name={token.alliance.alliance_name} />
                                </Col>
                            ))
                        }
                    </>
                }
            </Row>
        </Container>
    );
}