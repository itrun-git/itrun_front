import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AutorizationForm from "./components/Pages/AutorizationForm";
import RegistrationForm from "./components/Pages/RegistrationForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AutorizationForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
