import Card from "react-bootstrap/Card";
import { Link } from "react-router";

interface TokenPortraitProps {
    imgUrl: string;
    name: string;
    entityId: number;
    entityType: "Corporation" | "Alliance";
}

function TokenPortrait({ imgUrl: img_url, name, entityId, entityType }: TokenPortraitProps) {
    return (
        <Card as={Link} role="button" to={`${entityType.toLowerCase()}/${entityId}/contacts`} className="m-2 p-2 text-center border-0 shadow" style={{ width: '12rem' }}>
            <Card.Img variant="top" src={`${img_url}?size=256`} alt={name} className="rounded" />
            <Card.Body>
                <Card.Title>{name}</Card.Title>
            </Card.Body>
        </Card>
    );
}

export default TokenPortrait;