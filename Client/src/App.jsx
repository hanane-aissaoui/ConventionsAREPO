import LoginScreen from "./screens/LoginScreen"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import DashboardScreen from "./screens/DashboardScreen";
import ProgrammesPage from "./screens/ProgrammesScreen";
import ProgrammeDetail from "./screens/ProgrammeDetail";
import ProjetsScreen from "./screens/ProjetsScreen";
import ParametresScreen from "./screens/ParametresScreen";
import FicheProjet from "./screens/FicheProjet";
import FichePartenaire from "./screens/FichePartenaire";
import GestionPartenairesScreen from "./screens/GestionPartenairesScreen";
import TerritoireScreen from "./screens/TerritoireScreen";
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardScreen />
                </Layout>
              </ProtectedRoute>
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
          <Route
            path="/projets"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjetsScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FicheProjet />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parametres/"
            element={
              <ProtectedRoute>
                <Layout>
                  <ParametresScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/partenaires"
            element={
              <ProtectedRoute>
                <Layout>
                  <GestionPartenairesScreen />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/partenaires/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FichePartenaire />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/territoire"
            element={
              <ProtectedRoute>
                <Layout>
                  <TerritoireScreen />
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