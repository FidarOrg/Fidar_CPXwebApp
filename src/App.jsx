import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BankLanding from "./components/LandingPage.jsx";
import QrPage from "./components/qrpage";
import DashBoard from "./components/DashBoard";
import ProfilePage from "./components/profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./providers/LanguageProvider";
import EmpLogin from "./components/Emp-login.jsx";
import BindDevice from "./components/BindDevice.jsx";
import PrivacyPolicy from "./components/policies/Policypage";
import Terms from "./components/policies/Tcpage";
import AnalyticsPage from "./components/sidebar/Analytics";
import Settings from "./components/sidebar/Settings";
import PoliciesPage from "./components/sidebar/Policies";
import AuditPage from "./components/sidebar/Audit";


function App() {


  return (
    <Router>
      <Routes>

        <Route element={<LanguageProvider />}>
          <Route path="/Emp-login" element={<EmpLogin />} />
          <Route path="/bind-device" element={<BindDevice />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/" element={<BankLanding />} />
          <Route path="/qr" element={<QrPage />} />
          {/* SAML post-login landing — DashBoard with PasskeyBanner (session-based auth) */}
          <Route path="/saml-dashboard" element={<DashBoard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
