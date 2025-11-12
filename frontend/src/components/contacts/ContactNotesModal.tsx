import { type UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface ContactNotesModalProps {
    initialNotes: string;
    contactPk: number;
    mutation: UseMutationResult<void, Error, {
        newNotes: string;
        contactPk: number;
    }, unknown>
}

export default function ContactNotesModal({ initialNotes, mutation, contactPk }: ContactNotesModalProps) {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [notes, setNotes] = useState(initialNotes);

    const handleClose = () => {
        setShowModal(false);
        setNotes(initialNotes);
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
                    alert(t("contact.save.error"));
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
                    <Modal.Title>{t("notes_edit")}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <FloatingLabel
                            controlId="notesInput"
                            label={t("notes")}
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
                    <Button variant="secondary" onClick={handleClose}>{t("close")}</Button>
                    <Button variant="primary" onClick={() => { handleSave(notes); }}>{t("save")}</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

