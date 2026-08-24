import LoginScreen from "./screens/LoginScreen"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import ProgrammesPage from "./screens/ProgrammesScreen";
import ProgrammeDetail from "./screens/ProgrammeDetail";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <LoginScreen />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/programmes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProgrammesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/programmes/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProgrammeDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}