import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";

import Dashboard from "./components/dashboard/Dashboard";
import ErrorPage from "./components/ErrorPage";
import ContactTable from "./components/contacts/ContactTable";


const queryClient = new QueryClient();

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
            <Route path="alliance/:allianceId/contacts" element={<ContactTable entityType="Alliance" />} />
            <Route path="corporation/:corporationId/contacts" element={<ContactTable entityType="Corporation" />} />
            <Route path="*" element={<ErrorPage errorCode={404} message="Page Not Found" />} />
          </Route>
          <Route path="*" element={<Navigate to="/contacts/r/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App;
