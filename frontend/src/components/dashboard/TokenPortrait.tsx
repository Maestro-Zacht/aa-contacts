import Card from "react-bootstrap/Card";

function TokenPortrait({ img_url, name }: { img_url: string, name: string }) {
    return (
        <Card as={"a"} role="button" href="#" className="m-2 p-2 text-center border-0 shadow" style={{ width: '12rem' }}>
            <Card.Img variant="top" src={`${img_url}?size=256`} alt={name} className="rounded" />
            <Card.Body>
                <Card.Title>{name}</Card.Title>
            </Card.Body>
        </Card>
    );
}

export default TokenPortrait;