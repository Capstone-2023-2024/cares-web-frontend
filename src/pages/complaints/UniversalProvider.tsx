import type { CurrentUserRoleType } from "@cares/types/user";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AdviserProps } from "~/types/permissions";
import type { StudentWithClassSection } from "~/types/student";

export interface YearLevelSectionProps {
  yearLevel: string;
  section: StudentWithClassSection["section"];
}
interface WriteAdviserProps extends YearLevelSectionProps {
  src?: string;
  email: string;
  name?: string;
  dateCreated: number;
}
interface ReadAdviserProps extends WriteAdviserProps {
  id: string;
}
export interface UniversalProviderStateProps {
  role?: CurrentUserRoleType;
  mayorInfo?: StudentWithClassSection;
  adviserInfo?: ReadAdviserProps;
  studentsInfo?: StudentWithClassSection[];
  currentStudentInfo?: StudentWithClassSection;
}
const universalInitState: UniversalProviderStateProps = {};
interface UniversalContextProps extends UniversalProviderStateProps {
  setRole: (value: UniversalProviderStateProps["role"]) => void;
  setMayorInfo: (value: StudentWithClassSection) => void;
  setAdviserInfo: (value: AdviserProps, id: string) => void;
  setStudentsInfo: (value: StudentWithClassSection[]) => void;
  setCurrentStudentInfo: (value: StudentWithClassSection) => void;
}
interface UniversalProviderProps {
  children: ReactNode;
}
const UniversalContext = createContext<UniversalContextProps>({
  ...universalInitState,
  setRole: () => null,
  setMayorInfo: () => null,
  setAdviserInfo: () => null,
  setStudentsInfo: () => null,
  setCurrentStudentInfo: () => null,
});

const UniversalProvider = ({ children }: UniversalProviderProps) => {
  const [state, setState] = useState(universalInitState);
  console.log({ universal: state });
  const setRole = useCallback(
    (role: UniversalProviderStateProps["role"]) =>
      setState((prevState) => ({ ...prevState, role })),
    [],
  );
  const setMayorInfo = useCallback(
    (mayorInfo: StudentWithClassSection) =>
      setState((prevState) => ({ ...prevState, mayorInfo })),
    [],
  );
  const setAdviserInfo = useCallback(
    (adviserInfo: WriteAdviserProps, id: string) =>
      setState((prevState) => ({
        ...prevState,
        adviserInfo: { id, ...adviserInfo },
      })),
    [],
  );
  const setStudentsInfo = useCallback(
    (studentsInfo: StudentWithClassSection[]) =>
      setState((prevState) => ({ ...prevState, studentsInfo })),
    [],
  );
  const setCurrentStudentInfo = useCallback(
    (currentStudentInfo: StudentWithClassSection) =>
      setState((prevState) => ({ ...prevState, currentStudentInfo })),
    [],
  );

  return (
    <UniversalContext.Provider
      value={{
        ...state,
        setRole,
        setMayorInfo,
        setAdviserInfo,
        setStudentsInfo,
        setCurrentStudentInfo,
      }}
    >
      {children}
    </UniversalContext.Provider>
  );
};

/** Data in here are set-up in line 79 */
export const useUniversal = () => useContext(UniversalContext);
export default UniversalProvider;
