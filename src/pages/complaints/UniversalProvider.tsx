import type { CurrentUserRoleType } from "@cares/types/user";
import {
  and,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { collectionRef } from "~/types/firebase";
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
  const { adviserInfo, currentStudentInfo } = state;

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

  useEffect(() => {
    const yearLevel = adviserInfo?.yearLevel ?? currentStudentInfo?.yearLevel;
    const section = adviserInfo?.section ?? currentStudentInfo?.section;
    if (yearLevel !== undefined && section !== undefined) {
      const studentsArrayKey = "cares-students";
      const cachedStudents = localStorage.getItem(studentsArrayKey);
      const studentQuery = query(
        collectionRef("student"),
        and(
          where("yearLevel", "==", yearLevel),
          where("section", "==", section),
        ),
      );
      async function getStudentsFromServer() {
        const snapshot = await getDocs(studentQuery);
        const studentsHolder: StudentWithClassSection[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as StudentWithClassSection;
          studentsHolder.push(data);
        });
        localStorage.setItem(studentsArrayKey, JSON.stringify(studentsHolder));
        setStudentsInfo(studentsHolder);
      }
      /** Caches students into local storage, and TODO: remove cache if logging out */
      async function setStudents() {
        const result = await getCountFromServer(studentQuery);
        if (typeof cachedStudents === "string") {
          const parsedCachedStudents = JSON.parse(
            cachedStudents,
          ) as StudentWithClassSection[];
          const thereIsNewUpdate =
            result.data().count > parsedCachedStudents.length;
          return thereIsNewUpdate
            ? void getStudentsFromServer()
            : setStudentsInfo(parsedCachedStudents);
        }
        return void getStudentsFromServer();
      }
      return void setStudents();
    }
  }, [
    setStudentsInfo,
    adviserInfo?.yearLevel,
    adviserInfo?.section,
    currentStudentInfo?.yearLevel,
    currentStudentInfo?.section,
  ]);

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
