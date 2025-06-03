import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AutorizationForm from "./components/Pages/AutorizationForm";
import RegistrationForm from "./components/Pages/RegistrationForm";
import MainForm from "./components/Pages/MainForm";
import VerifyEmailRedirect from "./components/Compo/VerifyEmailRedirect"; 
import WorkspacePage from "./components/Pages/WorkspaceFrom";
//import NotFoundTitle from "./components/Pages/Compo/ErrorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AutorizationForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/verify-email" element={<VerifyEmailRedirect />} />
        <Route path="/mainform" element={<MainForm />} />
        <Route path="/workspace" element={<WorkspacePage/>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
