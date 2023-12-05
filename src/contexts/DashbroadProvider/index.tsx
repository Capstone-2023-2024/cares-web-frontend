import type { AnnouncementProps } from "@cares/common/types/announcement";
import {
  collection,
  getCountFromServer,
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
import { db } from "../../utils/firebase";

interface DashboardStateProps {
  countData: {
    name: AnnouncementProps["type"] | "student" | "permission";
    count: number;
    type: "announcement" | "student" | "admin";
  }[];
}

interface DashboardContextProps extends DashboardStateProps {
  refreshCountData: () => void;
}

interface DashboardProviderProps {
  children: ReactNode;
}
const initState: DashboardStateProps = {
  countData: [],
};
const DashboardContext = createContext<DashboardContextProps>({
  ...initState,
  refreshCountData: () => null,
});

const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [state, setState] = useState(initState);

  function refreshCountData() {
    void getDataFromServer();
  }
  const getDataFromServer = useCallback(async () => {
    try {
      const announcementBaseQuery = (type: AnnouncementProps["type"]) =>
        query(collection(db, "announcement"), where("type", "==", type));
      const studentBaseQuery = () => query(collection(db, "student"));
      const permissionBaseQuery = () => query(collection(db, "permission"));
      const memo = await getCountFromServer(
        announcementBaseQuery("university memorandum"),
      );
      const event = await getCountFromServer(announcementBaseQuery("event"));
      const others = await getCountFromServer(announcementBaseQuery("others"));
      const recognition = await getCountFromServer(
        announcementBaseQuery("recognition"),
      );
      const students = await getCountFromServer(studentBaseQuery());
      const permission = await getCountFromServer(permissionBaseQuery());
      const result: DashboardStateProps["countData"] = [
        {
          name: "university_memorandum" as AnnouncementProps["type"],
          count: memo.data().count,
          type: "announcement",
        },
        {
          name: "event" as AnnouncementProps["type"],
          count: event.data().count,
          type: "announcement",
        },
        {
          name: "others" as AnnouncementProps["type"],
          count: others.data().count,
          type: "announcement",
        },
        {
          name: "recognition" as AnnouncementProps["type"],
          count: recognition.data().count,
          type: "announcement",
        },
        {
          name: "student",
          count: students.data().count,
          type: "student",
        },
        {
          name: "permission",
          count: permission.data().count,
          type: "admin",
        },
      ];
      setState({ countData: result });
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    return void getDataFromServer();
  }, [getDataFromServer]);

  return (
    <DashboardContext.Provider value={{ ...state, refreshCountData }}>
      {children}
    </DashboardContext.Provider>
  );
};

export type {
  DashboardStateProps,
  DashboardContextProps,
  DashboardProviderProps,
};
export const useDashboard = () => useContext(DashboardContext);
export default DashboardProvider;
