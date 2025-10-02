import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Dashboard from "./components/dashboard/Dashboard";
import ErrorPage from "./components/ErrorPage";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/contacts/r/">
            <Route index element={<Dashboard />} />
            <Route path="*" element={<ErrorPage errorCode={404} message="Page Not Found" />} />
          </Route>
          <Route path="*" element={<Navigate to="/contacts/r/" replace />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App;
