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
      <ToggleProvider>
        <DateProvider>{props.children}</DateProvider>
      </ToggleProvider>
    </AuthProvider>
  );
};

export default ContextProviders;
