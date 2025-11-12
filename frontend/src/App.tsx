import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import Dashboard from "./components/dashboard/Dashboard";
import ErrorPage from "./components/ErrorPage";
import ContactList from "./components/contacts/ContactList";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

i18n
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    detection: {
      order: [
        "htmlTag",
        "querystring",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "path",
        "subdomain",
      ],
      htmlTag: document.getElementById("root"),
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    react: {
      useSuspense: false, //   <---- this will do the magic
    },
    backend: {
      loadPath: "/static/aa_contacts/react/i18n/{{lng}}/{{ns}}.json",
    },
  });

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
    import("@tanstack/query-core").QueryClient;
  }
}

if (import.meta.env.MODE === 'development') {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/contacts/r/">
            <Route index element={<Dashboard />} />
            <Route path="alliance/:allianceId/contacts" element={<ContactList entityType="Alliance" />} />
            <Route path="corporation/:corporationId/contacts" element={<ContactList entityType="Corporation" />} />
            <Route path="*" element={<ErrorPage errorCode={404} message="Page Not Found" />} />
          </Route>
          <Route path="*" element={<Navigate to="/contacts/r/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App;
