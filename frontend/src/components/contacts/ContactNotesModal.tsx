import { type UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";

interface ContactNotesModalProps {
    initialNotes: string;
    contactPk: number;
    mutation: UseMutationResult<void, Error, {
        newNotes: string;
        contactPk: number;
    }, unknown>
}

export default function ContactNotesModal({ initialNotes, mutation, contactPk }: ContactNotesModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [notes, setNotes] = useState(initialNotes);

    const handleClose = () => {
        setShowModal(false);
    };

    const handleSave = (notes: string) => {
        mutation.mutate(
            { newNotes: notes, contactPk },
            {
                onSuccess: () => {
                    handleClose();
                },
                onError: (error) => {
                    console.error("Error saving contact notes: ", error);
                    alert("Error saving contact notes. Contact an administrator.");
                    handleClose();
                }
            }
        );
    };

    return (
        <>
            <Button variant="outline-success" size="sm" onClick={() => setShowModal(true)}>
                <i className="fa-solid fa-pen"></i>
            </Button>
            <Modal show={showModal} onHide={handleClose} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Notes</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <FloatingLabel
                            controlId="notesInput"
                            label="Notes"
                            className="mb-3"
                        >
                            <Form.Control
                                as="textarea"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ height: '200px' }}
                                autoFocus
                            />
                        </FloatingLabel>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={() => { handleSave(notes); }}>Save</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

