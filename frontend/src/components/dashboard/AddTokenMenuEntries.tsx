import ReactDOM from "react-dom";
import { Nav } from "react-bootstrap";

import { getUserPermission } from "../../api/api";
import { useQuery } from "@tanstack/react-query";

const menuRoot = document.getElementById("nav-right");

export default function AddTokenMenuEntries() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['permissions', 'me'],
        queryFn: getUserPermission,
    });

    if (!menuRoot || isLoading || error) {
        return <></>;
    }

    const userPermissions = data || {
        can_manage_alliance_contacts: false,
        can_manage_corporation_contacts: false
    };

    return ReactDOM.createPortal(
        <>
            {userPermissions.can_manage_alliance_contacts && (
                <Nav.Item as="li">
                    <Nav.Link href="/contacts/alliance/add_token/" key={"add_alliance_token"}>
                        Add Alliance Token
                    </Nav.Link>
                </Nav.Item>
            )}

            {userPermissions.can_manage_corporation_contacts && (
                <Nav.Item as="li">
                    <Nav.Link href="/contacts/corporation/add_token/" key={"add_corporation_token"}>
                        Add Corporation Token
                    </Nav.Link>
                </Nav.Item>
            )}
        </>,
        menuRoot
    );
}