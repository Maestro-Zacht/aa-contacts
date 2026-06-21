import { useState } from "react";
import { Button } from "react-bootstrap";

interface CopyButtonProps {
    value: string;
}

export default function CopyButton({ value }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Button variant="outline-secondary" size="sm" onClick={handleCopy}>
            <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
        </Button>
    );
}
