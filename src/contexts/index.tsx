import React, { type ReactNode } from "react";
import AuthProvider from "./AuthContext";
import DateProvider from "./DateContext";
import ToggleProvider from "./ToggleContext";
import AnnouncementProvider from "./AnnouncementContext";

interface ContextProviders {
  children: ReactNode;
}

const ContextProviders = (props: ContextProviders) => {
  return (
    <AuthProvider>
      <DateProvider>
        <ToggleProvider>
          <AnnouncementProvider>{props.children}</AnnouncementProvider>
        </ToggleProvider>
      </DateProvider>
    </AuthProvider>
  );
};

export default ContextProviders;
