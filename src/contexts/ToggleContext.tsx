import React, {
  createContext,
  useContext,
  type ReactNode,
  useState,
} from "react";

interface InitialStateProps {
  showCalendar: boolean;
}
interface ToggleContextType extends InitialStateProps {
  toggleCalendar: () => void;
}
interface ToggleProviderType {
  children: ReactNode;
}

const initialState: InitialStateProps = {
  showCalendar: false,
};

const ToggleContext = createContext<ToggleContextType>({
  ...initialState,
  toggleCalendar: () => null,
});
const ToggleProvider = ({ children }: ToggleProviderType) => {
  const [{ showCalendar }, setState] = useState(initialState);
  function handleState(
    key: keyof InitialStateProps,
    value: InitialStateProps["showCalendar"]
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
