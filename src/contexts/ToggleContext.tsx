import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
} from "react";

interface InitialStateType {
  showCalendar: boolean;
}
interface ToggleContextType extends InitialStateType {
  toggleCalendar: () => void;
}
interface ToggleProviderType {
  children: ReactNode;
}

const initialState: InitialStateType = {
  showCalendar: false,
};

const ToggleContext = createContext<ToggleContextType>({
  ...initialState,
  toggleCalendar: () => null,
});
const ToggleProvider = ({ children }: ToggleProviderType) => {
  const [{ showCalendar }, setState] = useState(initialState);
  function handleState(
    key: keyof InitialStateType,
    value: InitialStateType["showCalendar"]
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function toggleCalendar() {
    handleState("showCalendar", !showCalendar);
  }

  return (
    <ToggleContext.Provider value={{ showCalendar, toggleCalendar }}>
      {children}
    </ToggleContext.Provider>
  );
};

export const useToggle = () => useContext(ToggleContext);
export default ToggleProvider;
