import type { paths } from "./Schema";
import Cookies from "js-cookie";
import createClient from "openapi-fetch";

const apiClient = createClient<paths>({
    baseUrl: "/",
    headers: {
        "X-CSRF-Token": Cookies.get("XSRF-TOKEN") || "",
    },
});

export default apiClient;
