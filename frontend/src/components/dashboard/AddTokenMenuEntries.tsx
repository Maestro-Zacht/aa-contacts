// import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { Nav } from "react-bootstrap";

const menuRoot = document.getElementById("nav-right");

export default function AddTokenMenuEntries() {
    // const [innerHtmlEmptied, setInnerHtmlEmptied] = useState(false);

    // useEffect(() => {
    //     if (!innerHtmlEmptied) {
    //         if (menuRoot) {
    //             menuRoot.innerHTML = "";
    //             setInnerHtmlEmptied(true);
    //         }
    //     }
    // }, [innerHtmlEmptied]);

    // if (!innerHtmlEmptied) return null;
    if (!menuRoot) {
        return <></>;
    }

    return ReactDOM.createPortal(
        <>
            <Nav.Item as="li">
                <Nav.Link href="/contacts/alliance/add_token/" key={"add_alliance_token"}>
                    Add Alliance Token
                </Nav.Link>
            </Nav.Item>

            <Nav.Item as="li">
                <Nav.Link href="/contacts/corporation/add_token/" key={"add_corporation_token"}>
                    Add Corporation Token
                </Nav.Link>
            </Nav.Item>
        </>,
        menuRoot
    );
}