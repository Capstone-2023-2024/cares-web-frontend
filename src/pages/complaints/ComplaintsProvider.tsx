import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  ReadConcernBaseProps,
  ReadConcernProps,
} from "~/types/complaints";

interface ComplaintsProviderStateProps {
  otherComplaints: ReadConcernProps[];
  classSectionComplaints: ReadConcernBaseProps[];
  currentStudentComplaints: ReadConcernProps[];
}
const complaintsInitState: ComplaintsProviderStateProps = {
  otherComplaints: [],
  classSectionComplaints: [],
  currentStudentComplaints: [],
};
interface ComplaintsContextProps extends ComplaintsProviderStateProps {
  setOtherComplaints: (
    array: ComplaintsProviderStateProps["otherComplaints"]
  ) => void;
  setClassSectionComplaints: (
    array: ComplaintsProviderStateProps["classSectionComplaints"]
  ) => void;
  setCurrentStudentComplaints: (
    array: ComplaintsProviderStateProps["currentStudentComplaints"]
  ) => void;
}
interface ComplaintsProviderProps {
  children: ReactNode;
}
const ComplaintsContext = createContext<ComplaintsContextProps>({
  ...complaintsInitState,
  setOtherComplaints: () => null,
  setClassSectionComplaints: () => null,
  setCurrentStudentComplaints: () => null,
});

const ComplaintsProvider = ({ children }: ComplaintsProviderProps) => {
  const [state, setState] = useState(complaintsInitState);
  console.log({ complaints: state });
  const setOtherComplaints = useCallback(
    (otherComplaints: ComplaintsProviderStateProps["otherComplaints"]) => {
      console.log({ otherComplaints });
      setState((prevState) => ({ ...prevState, otherComplaints }));
    },
    []
  );
  const setClassSectionComplaints = useCallback(
    (
      classSectionComplaints: ComplaintsProviderStateProps["classSectionComplaints"]
    ) => {
      console.log({ classSectionComplaints });
      setState((prevState) => ({ ...prevState, classSectionComplaints }));
    },
    []
  );
  const setCurrentStudentComplaints = useCallback(
    (
      currentStudentComplaints: ComplaintsProviderStateProps["currentStudentComplaints"]
    ) => {
      console.log({ currentStudentComplaints });
      setState((prevState) => ({ ...prevState, currentStudentComplaints }));
    },
    []
  );

  return (
    <ComplaintsContext.Provider
      value={{
        ...state,
        setOtherComplaints,
        setClassSectionComplaints,
        setCurrentStudentComplaints,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
};

/** Collection of complaints */
export const useComplaints = () => useContext(ComplaintsContext);
export default ComplaintsProvider;
