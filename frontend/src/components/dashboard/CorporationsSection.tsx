import { useQuery } from "@tanstack/react-query";
import { Col, Container, Row } from "react-bootstrap";
import Loading from "../Loading";
import TokenPortrait from "./TokenPortrait";
import { getCorporationContactTokens } from "../../api/api";
import { useTranslation } from "react-i18next";

export default function CorporationsSection() {
    const { t } = useTranslation();
    const { data, isLoading, error } = useQuery({
        queryKey: ['corporations', 'tokens'],
        queryFn: getCorporationContactTokens,
    });

    if (error) {
        console.error(error);
        return <p>{t("corporation.loading.error")}</p>;
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
                            corporationTokens.length > 0 ?
                                corporationTokens.map(token => (
                                    <Col key={token.corporation.corporation_id} xs="auto" className="mx-5">
                                        <TokenPortrait
                                            imgUrl={token.corporation.logo_url}
                                            name={token.corporation.corporation_name}
                                            entityId={token.corporation.corporation_id}
                                            entityType="Corporation"
                                        />
                                    </Col>
                                ))
                                :
                                <Col xs="auto" className="mt-5">
                                    <p>{t("corporation.token.missing")}</p>
                                </Col>
                        }
                    </>
                }
            </Row>
        </Container>
    );
}