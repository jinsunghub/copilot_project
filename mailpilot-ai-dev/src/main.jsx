import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./components/Login";
import "./App.css";

const Root = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  return isLoggedIn ? (
    <App email={email} appPassword={appPassword} />
  ) : (
    <Login
      setIsLoggedIn={setIsLoggedIn}
      setEmail={setEmail}
      setAppPassword={setAppPassword}
    />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
