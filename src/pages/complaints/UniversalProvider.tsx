import type { FirestoreDatabaseProps } from "@cares/types/document";
import type {
  AdviserInfoProps,
  ClassSectionProps,
  CurrentUserRoleType,
  StudentInfoProps,
} from "@cares/types/user";
import {
  addDoc,
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
import { collectionRef } from "~/utils/firebase";

export interface YearLevelSectionProps {
  yearLevel: string;
  section: StudentInfoProps["section"];
}
interface ReadAdviserInfoProps
  extends AdviserInfoProps,
    FirestoreDatabaseProps {
  src?: string;
}
export interface UniversalProviderStateProps {
  role?: CurrentUserRoleType;
  queryId: string | null;
  mayorInfo?: StudentInfoProps;
  adviserInfo?: ReadAdviserInfoProps;
  studentsInfo?: StudentInfoProps[];
  currentStudentInfo?: StudentInfoProps;
}
const universalInitState: UniversalProviderStateProps = {
  queryId: null,
};
interface UniversalContextProps extends UniversalProviderStateProps {
  setRole: (value: UniversalProviderStateProps["role"]) => void;
  setMayorInfo: (value: StudentInfoProps) => void;
  setAdviserInfo: (value: AdviserInfoProps, id: string) => void;
  setStudentsInfo: (value: StudentInfoProps[]) => void;
  setCurrentStudentInfo: (value: StudentInfoProps) => void;
  returnComplaintsQuery: (props: ClassSectionProps) => Promise<void>;
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
  returnComplaintsQuery: async () => {
    const promise = new Promise(function (
      resolve: (props: void) => void,
      reject: (props: void) => void,
    ) {
      resolve;
      reject;
    });
    return promise;
  },
});

const UniversalProvider = ({ children }: UniversalProviderProps) => {
  const [state, setState] = useState(universalInitState);
  const { adviserInfo, currentStudentInfo } = state;
  console.log({ queryId: state.queryId });
  const setRole = useCallback(
    (role: UniversalProviderStateProps["role"]) =>
      setState((prevState) => ({ ...prevState, role })),
    [],
  );
  const setMayorInfo = useCallback(
    (mayorInfo: StudentInfoProps) =>
      setState((prevState) => ({ ...prevState, mayorInfo })),
    [],
  );
  const setAdviserInfo = useCallback(
    (adviserInfo: AdviserInfoProps, id: string) =>
      setState((prevState) => ({
        ...prevState,
        adviserInfo: { id, ...adviserInfo },
      })),
    [],
  );
  const setStudentsInfo = useCallback(
    (studentsInfo: StudentInfoProps[]) =>
      setState((prevState) => ({ ...prevState, studentsInfo })),
    [],
  );
  const setCurrentStudentInfo = useCallback(
    (currentStudentInfo: StudentInfoProps) =>
      setState((prevState) => ({ ...prevState, currentStudentInfo })),
    [],
  );
  const returnComplaintsQuery = useCallback(
    async ({ yearLevel, section }: ClassSectionProps) => {
      const thisYear = new Date().getFullYear();
      const nextYear = thisYear + 1;
      const formatYearStringify = `${thisYear}-${nextYear}`;
      const complaintQuery = query(
        collectionRef("complaints"),
        and(
          where("yearLevel", "==", yearLevel),
          where("section", "==", section),
          where("academicYear", "==", formatYearStringify),
        ),
      );
      try {
        const result = await getCountFromServer(complaintQuery);
        if (result.data().count === 0) {
          const documentRef = await addDoc(collectionRef("complaints"), {
            time: new Date().getTime(),
            section,
            yearLevel,
            academicYear: formatYearStringify,
          });
          console.log({ documentRef }, documentRef.id);
          return setState((prevState) => ({
            ...prevState,
            queryId: documentRef.id,
          }));
        }
        console.log("Catch write");
        const snapshot = await getDocs(complaintQuery);
        const doc = snapshot.docs[0];
        if (doc?.exists()) {
          console.log("Exists", doc.id);
          setState((prevState) => ({
            ...prevState,
            queryId: doc.id,
          }));
        }
      } catch (err) {
        console.log(err, "Error in returning complaints Query");
      }
    },
    [],
  );
  /** Year Level and Sections set-up */
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
        const studentsHolder: StudentInfoProps[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as StudentInfoProps;
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
          ) as StudentInfoProps[];
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
        returnComplaintsQuery,
        setCurrentStudentInfo,
      }}
    >
      {children}
    </UniversalContext.Provider>
  );
};

export const useUniversal = () => useContext(UniversalContext);
export default UniversalProvider;
