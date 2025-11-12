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
import { useTranslation } from "react-i18next";


interface HeaderProps {
    entityId: number;
    name: string;
    lastUpdate: string;
    updateFn: (entityId: number) => Promise<void>;
    invalidateQueries: () => Promise<void>;
}

function Header({ entityId, name, lastUpdate, updateFn, invalidateQueries }: HeaderProps) {
    const { t } = useTranslation();
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
                    {t('contact.for', { name })}
                </h1>
            </header>
            <Container fluid>
                <Row className="justify-content-center my-3">
                    <Col md={4}>
                        <Card className="text-center">
                            <Card.Header>{t("info")}</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            {t("last_updated")} <Badge className="text-center ms-1" bg="success">
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
                                    {mutation.isPending ? <Loading /> : mutation.isError ? t("error!") : t("update")}
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
    const { t } = useTranslation();
    const { data, isLoading, error } = useQuery({
        queryKey: ['alliance', 'tokens', allianceId],
        queryFn: () => getAllianceToken(allianceId),
    });

    if (error) {
        console.error(error);
        return <p>{t("alliance.info.loading.error")}</p>;
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
                    name={data?.alliance.alliance_name || t("alliance.unknown")}
                    lastUpdate={data?.last_update || t("unknown")}
                    updateFn={updateAllianceContacts}
                    invalidateQueries={invalidateQueries}
                />
            }
        </>
    )
}

export function CorporationHeader({ corporationId }: { corporationId: number }) {
    const { t } = useTranslation();
    const { data, isLoading, error } = useQuery({
        queryKey: ['corporation', 'tokens', corporationId],
        queryFn: () => getCorporationToken(corporationId),
    });

    if (error) {
        console.error(error);
        return <p>{t("corporation.info.loading.error")}</p>;
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
                    name={data?.corporation.corporation_name || t("corporation.unknown")}
                    lastUpdate={data?.last_update || t("unknown")}
                    updateFn={updateCorporationContacts}
                    invalidateQueries={invalidateQueries}
                />
            }
        </>
    )
}