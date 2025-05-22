import React from "react";
import { HeaderMenu } from "../Compo/header";
import '../Style/MainFrom.css';

const MainForm: React.FC = () => {
  return (
    <>
      <header className="site-header">
        <HeaderMenu />
      </header>
      <main>
        <h1>Test</h1>
      </main>
    </>
  );
};

export default MainForm;
