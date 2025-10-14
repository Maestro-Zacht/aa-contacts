import { Spinner } from "react-bootstrap";

export default function Loading() {
    return (
        <Spinner role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    );
}