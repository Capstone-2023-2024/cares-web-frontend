import React, { type ReactNode } from "react";
import AuthProvider from "./AuthContext";
import DateProvider from "./DateContext";

interface ContextProviders {
  children: ReactNode;
}

const ContextProviders = (props: ContextProviders) => {
  return (
    <AuthProvider>
      <DateProvider>{props.children}</DateProvider>
    </AuthProvider>
  );
};

export default ContextProviders;
