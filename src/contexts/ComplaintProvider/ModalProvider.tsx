import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface ModalProviderStateProps {
  showStudents: boolean;
  showMayorModal: boolean;
  showTurnOverPopUp: boolean;
  showTurnOverModal: boolean;
}
const modalInitState: ModalProviderStateProps = {
  showStudents: false,
  showMayorModal: false,
  showTurnOverPopUp: false,
  showTurnOverModal: false,
};
interface ModalContextProps extends ModalProviderStateProps {
  setShowStudents: (value: boolean) => void;
  setShowMayorModal: (value: boolean) => void;
  setShowTurnOverPopUp: (value: boolean) => void;
  setShowTurnOverModal: (value: boolean) => void;
}
interface ModalProviderProps {
  children: ReactNode;
}
const ModalContext = createContext<ModalContextProps>({
  ...modalInitState,
  setShowStudents: () => null,
  setShowMayorModal: () => null,
  setShowTurnOverPopUp: () => null,
  setShowTurnOverModal: () => null,
});

const ModalProvider = ({children}: ModalProviderProps) => {
  const [state, setState] = useState(modalInitState);
  // console.log({ modals: state });
  function handleState(key: keyof ModalProviderStateProps, value: boolean) {
    setState(prevState => ({...prevState, [key]: value}));
  }

  function setShowStudents(value: boolean) {
    handleState('showStudents', value);
  }
  function setShowMayorModal(value: boolean) {
    handleState('showMayorModal', value);
  }
  function setShowTurnOverPopUp(value: boolean) {
    handleState('showTurnOverPopUp', value);
  }
  function setShowTurnOverModal(value: boolean) {
    handleState('showTurnOverModal', value);
  }

  return (
    <ModalContext.Provider
      value={{
        ...state,
        setShowStudents,
        setShowMayorModal,
        setShowTurnOverPopUp,
        setShowTurnOverModal,
      }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
export default ModalProvider;
