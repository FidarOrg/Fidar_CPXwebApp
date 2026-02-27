import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BankLanding from "./components/LandingPage.jsx";
import QrPage from "./components/qrpage";
import DashBoard from "./components/DashBoard";
import ProfilePage from "./components/profile";
import ActionsPage from "./demo/ActionPage";
import CreateUserPage from "./demo/CreateUserButton";
import CallVerificationPage from "./demo/CallVerification";
import SalesVerificationPage from "./demo/SalesVerification";
import ATMDashboard from "./components/ATM-Dashboard";
import AtmQrPage from "./components/Atm-qrpage";
import ThreeDS from "./demo/3ds";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./providers/LanguageProvider";
import BankLogin from "./components/Bank-Login";
import AtmLogin from "./components/Atm-Login";
import PrivacyPolicy from "./components/policies/Policypage";
import Terms from "./components/policies/Tcpage";
import AnalyticsPage from "./components/sidebar/Analytics";
import Settings from "./components/sidebar/Settings";


function App() {


  return (
    <Router>
      <Routes>
 
        <Route element={<LanguageProvider />}>
          <Route path="/bank-login" element={<BankLogin />} />
          <Route path="/privacy" element={<PrivacyPolicy/> } />
          <Route path="/terms" element={<Terms/> } />
          <Route path="/" element={<BankLanding />} />
          <Route path="/atm-login" element={<AtmLogin />} />
          <Route path="/qr" element={<QrPage/>} />
          <Route path="/atm-qr" element={<AtmQrPage />} />        
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashBoard/>} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/atm-dashboard" element={<ATMDashboard />} />
              <Route path="/demo" element={<ActionsPage/>} />
              <Route path="/create-user" element={<CreateUserPage />} />
              <Route path="/call-verification" element={<CallVerificationPage />} />
              <Route path="/sales-verification" element={<SalesVerificationPage />} />
              <Route path="/3ds" element={<ThreeDS/>} />
          </Route>
         </Route>
      </Routes>
    </Router>
  )
}

export default App
