import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  ComplaintBaseProps,
  ComplaintProps,
} from "@cares/common/types/complaint";
import type { FirestoreDatabaseProps } from "@cares/common/types/document";

interface ReadComplaintBaseProps
  extends ComplaintBaseProps,
    FirestoreDatabaseProps {}
interface ReadComplaintProps extends ComplaintProps, FirestoreDatabaseProps {}

interface ComplaintsProviderStateProps {
  otherComplaints: ReadComplaintProps[];
  classSectionComplaints: ReadComplaintBaseProps[];
  currentStudentComplaints: ReadComplaintProps[];
}
const complaintsInitState: ComplaintsProviderStateProps = {
  otherComplaints: [],
  classSectionComplaints: [],
  currentStudentComplaints: [],
};
interface ComplaintsContextProps extends ComplaintsProviderStateProps {
  setOtherComplaints: (
    array: ComplaintsProviderStateProps["otherComplaints"],
  ) => void;
  setClassSectionComplaints: (
    array: ComplaintsProviderStateProps["classSectionComplaints"],
  ) => void;
  setCurrentStudentComplaints: (
    array: ComplaintsProviderStateProps["currentStudentComplaints"],
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
  const setOtherComplaints = useCallback(
    (otherComplaints: ComplaintsProviderStateProps["otherComplaints"]) => {
      setState((prevState) => ({ ...prevState, otherComplaints }));
    },
    [],
  );
  const setClassSectionComplaints = useCallback(
    (
      classSectionComplaints: ComplaintsProviderStateProps["classSectionComplaints"],
    ) => {
      setState((prevState) => ({ ...prevState, classSectionComplaints }));
    },
    [],
  );
  const setCurrentStudentComplaints = useCallback(
    (
      currentStudentComplaints: ComplaintsProviderStateProps["currentStudentComplaints"],
    ) => {
      setState((prevState) => ({ ...prevState, currentStudentComplaints }));
    },
    [],
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
