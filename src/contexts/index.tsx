import React, { type ReactNode } from "react";
import AuthProvider from "./AuthContext";

interface ContextProviders {
  children: ReactNode;
}

const ContextProviders = (props: ContextProviders) => {
  return <AuthProvider>{props.children}</AuthProvider>;
};

export default ContextProviders;
