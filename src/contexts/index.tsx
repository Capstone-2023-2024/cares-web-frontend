import React, { type ReactNode } from "react";
import AuthProvider from "./AuthContext";
import DateProvider from "./DateContext";
import ToggleProvider from "./ToggleContext";

interface ContextProviders {
  children: ReactNode;
}

const ContextProviders = (props: ContextProviders) => {
  return (
    <AuthProvider>
      <DateProvider>
        <ToggleProvider>{props.children}</ToggleProvider>
      </DateProvider>
    </AuthProvider>
  );
};

export default ContextProviders;
