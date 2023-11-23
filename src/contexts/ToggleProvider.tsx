import { createContext, useContext, useState, type ReactNode } from "react"

interface InitialStateProps {
  showNav: boolean
  showCalendar: boolean
}
interface ToggleContextType extends InitialStateProps {
  toggleNav: (value: boolean) => void
  toggleCalendar: () => void
}
interface ToggleProviderType {
  children: ReactNode
}

const initialState: InitialStateProps = {
  showNav: false,
  showCalendar: false,
}

const ToggleContext = createContext<ToggleContextType>({
  ...initialState,
  toggleNav: () => null,
  toggleCalendar: () => null,
})
const ToggleProvider = ({ children }: ToggleProviderType) => {
  const [state, setState] = useState(initialState)

  function toggleNav(value: boolean) {
    setState((prevState) => ({ ...prevState, showNav: value }))
  }
  function toggleCalendar() {
    setState((prevState) => ({
      ...prevState,
      showCalendar: !prevState.showCalendar,
    }))
  }

  return (
    <ToggleContext.Provider value={{ ...state, toggleNav, toggleCalendar }}>
      {children}
    </ToggleContext.Provider>
  )
}

export type { InitialStateProps, ToggleContextType, ToggleProviderType }
export const useToggle = () => useContext(ToggleContext)
export default ToggleProvider
