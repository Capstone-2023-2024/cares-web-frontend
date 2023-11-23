import React, { type ReactNode } from "react"
import AuthProvider from "./AuthProvider"
import DateProvider from "./DateProvider"
import ToggleProvider from "./ToggleProvider"
import AnnouncementProvider from "./AnnouncementProvider"

interface ContextProvidersProps {
  children: ReactNode
}

const ContextProviders = (props: ContextProvidersProps) => {
  return (
    <AuthProvider>
      <DateProvider>
        <ToggleProvider>
          <AnnouncementProvider>{props.children}</AnnouncementProvider>
        </ToggleProvider>
      </DateProvider>
    </AuthProvider>
  )
}

export type { ContextProvidersProps }
export default ContextProviders
