import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Dashboard from "./components/dashboard/Dashboard";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route index element={<Navigate to="/contacts/r/" replace />} />
          <Route path="/contacts/r/" element={<Dashboard />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App;
