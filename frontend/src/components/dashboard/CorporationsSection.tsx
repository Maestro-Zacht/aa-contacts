import { useQuery } from "@tanstack/react-query";
import { Col, Container, Row } from "react-bootstrap";
import Loading from "../Loading";
import TokenPortrait from "./TokenPortrait";
import { getCorporationContactTokens } from "../../api/api";

export default function CorporationsSection() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['corporation', 'tokens'],
        queryFn: getCorporationContactTokens,
    });

    if (error) {
        console.error(error);
        return <p>Error loading corporation contact tokens. Contact administrators</p>;
    }

    const corporationTokens = data || [];

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
                            corporationTokens.map(token => (
                                <Col key={token.id} xs="auto" className="mx-5">
                                    <TokenPortrait img_url={token.corporation.logo_url} name={token.corporation.corporation_name} />
                                </Col>
                            ))
                        }
                    </>
                }
            </Row>
        </Container>
    );
}