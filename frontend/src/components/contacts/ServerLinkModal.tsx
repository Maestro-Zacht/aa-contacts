import { type UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, Button, FloatingLabel, Form, InputGroup, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import type { components } from "../../api/Schema";
import CopyButton from "./CopyButton";

type ServerLinkSchema = components["schemas"]["ServerLinkSchema"];
type ServerLinkInputSchema = components["schemas"]["ServerLinkInputSchema"];
type Color = components["schemas"]["Color"];

const COLORS: Color[] = [
    "primary", "secondary", "success", "danger", "warning", "info", "light", "dark"
];

interface ServerLinkModalProps {
    link?: ServerLinkSchema;
    contactPk: number;
    canManage: boolean;
    createMutation: UseMutationResult<ServerLinkSchema | undefined, Error, { contactPk: number; body: ServerLinkInputSchema }, unknown>;
    updateMutation: UseMutationResult<ServerLinkSchema | undefined, Error, { contactPk: number; linkPk: number; body: ServerLinkInputSchema }, unknown>;
    deleteMutation: UseMutationResult<void, Error, { contactPk: number; linkPk: number }, unknown>;
}

// `link` undefined => this is the "add" badge (create flow); otherwise it renders an
// existing link as a badge that opens in read-only view mode.
export default function ServerLinkModal({ link, contactPk, canManage, createMutation, updateMutation, deleteMutation }: ServerLinkModalProps) {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    // Start in edit mode only when creating (no existing link to view).
    const [editing, setEditing] = useState(link === undefined);
    // Controlled form fields, seeded from the existing link or sensible defaults.
    const [name, setName] = useState(link?.name ?? "");
    const [url, setUrl] = useState(link?.url ?? "");
    const [password, setPassword] = useState(link?.password ?? "");
    const [color, setColor] = useState<Color>(link?.color ?? "secondary");
    const [showPassword, setShowPassword] = useState(false);

    // Restore fields/mode to their initial state (after close, or when cancelling an edit).
    const resetFields = () => {
        setEditing(link === undefined);
        setName(link?.name ?? "");
        setUrl(link?.url ?? "");
        setPassword(link?.password ?? "");
        setColor(link?.color ?? "secondary");
        setShowPassword(false);
    };

    const handleClose = () => {
        setShowModal(false);
        resetFields();
    };

    // Cancel from edit mode: existing link returns to view mode; a new link closes the modal.
    const handleCancel = () => {
        if (link) {
            resetFields();
        } else {
            handleClose();
        }
    };

    // Persist the form: PUT when editing an existing link, POST when creating one.
    const handleSave = () => {
        const body: ServerLinkInputSchema = { name, url, password, color };
        const options = {
            onSuccess: () => handleClose(),
            onError: (error: Error) => {
                console.error("Error saving server link: ", error);
                alert(t("server_link.save.error"));
            }
        };
        if (link) {
            updateMutation.mutate({ contactPk, linkPk: link.id, body }, options);
        } else {
            createMutation.mutate({ contactPk, body }, options);
        }
    };

    const handleDelete = () => {
        if (!link) return;
        if (!window.confirm(t("server_link.delete_confirm"))) return;
        deleteMutation.mutate(
            { contactPk, linkPk: link.id },
            { onSuccess: () => handleClose() }
        );
    };

    // Title reflects the current mode: edit vs. create (both editing) vs. read-only view.
    const title = editing
        ? (link ? t("server_link.edit") : t("server_link.create"))
        : t("server_link.view");

    return (
        <>
            {/* Trigger: a colored badge for an existing link, or a "+" badge for the create flow. */}
            {link ? (
                <Badge bg={link.color} className="me-1" role="button" onClick={() => setShowModal(true)}>
                    {link.name}
                </Badge>
            ) : (
                <Badge bg="secondary" className="me-1" role="button" title={t("server_link.add")} onClick={() => setShowModal(true)}>
                    <i className="fa-solid fa-plus"></i>
                </Badge>
            )}

            <Modal show={showModal} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* View mode: read-only URL/password rows with copy (and reveal) controls. */}
                    {link && !editing ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("server_link.url")}</Form.Label>
                                <InputGroup>
                                    <Form.Control type="text" value={link.url} readOnly />
                                    <CopyButton value={link.url} />
                                </InputGroup>
                            </Form.Group>
                            {/* Password row only appears when the link actually has a password. */}
                            {link.password && (
                                <Form.Group className="mb-3">
                                    <Form.Label>{t("server_link.password")}</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            value={link.password}
                                            readOnly
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            title={showPassword ? t("server_link.hide") : t("server_link.reveal")}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                        </Button>
                                        <CopyButton value={link.password} />
                                    </InputGroup>
                                </Form.Group>
                            )}
                        </>
                    ) : (
                        /* Edit/create mode: editable form with a live badge preview of the chosen color. */
                        <Form>
                            <FloatingLabel controlId="serverLinkName" label={t("server_link.name")} className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("server_link.name")}
                                    required
                                    autoFocus
                                />
                            </FloatingLabel>
                            <FloatingLabel controlId="serverLinkUrl" label={t("server_link.url")} className="mb-3">
                                <Form.Control
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder={t("server_link.url")}
                                    required
                                />
                            </FloatingLabel>
                            <FloatingLabel controlId="serverLinkPassword" label={t("server_link.password")} className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("server_link.password")}
                                />
                            </FloatingLabel>
                            <FloatingLabel controlId="serverLinkColor" label={t("server_link.color")} className="mb-3">
                                <Form.Select value={color} onChange={(e) => setColor(e.target.value as Color)}>
                                    {COLORS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                            <div>
                                <Badge bg={color}>{name || t("server_link.word", { count: 1 })}</Badge>
                            </div>
                        </Form>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    {/* View mode: Close, plus Edit/Delete only when the user can manage links. */}
                    {link && !editing ? (
                        <>
                            <Button variant="secondary" onClick={handleClose}>{t("close")}</Button>
                            {canManage && (
                                <>
                                    <Button variant="primary" onClick={() => setEditing(true)}>
                                        <i className="fa-solid fa-pen me-1"></i>{t("server_link.edit")}
                                    </Button>
                                    <Button variant="outline-danger" onClick={handleDelete}>
                                        <i className="fa-solid fa-trash me-1"></i>{t("server_link.delete")}
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        /* Edit/create mode: Cancel and Save (disabled until name + url are filled). */
                        <>
                            <Button variant="secondary" onClick={handleCancel}>{t("cancel")}</Button>
                            <Button variant="primary" onClick={handleSave} disabled={!name || !url}>{t("save")}</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
}
