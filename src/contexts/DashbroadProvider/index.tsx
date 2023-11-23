import type { AnnouncementProps } from "@cares/types/announcement"
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { db } from "../../utils/firebase"

interface DashboardStateProps {
  countData: { name: AnnouncementProps["type"]; count: number }[]
}

interface DashboardContextProps extends DashboardStateProps {
  refreshCountData: () => void
}

interface DashboardProviderProps {
  children: ReactNode
}
const initState: DashboardStateProps = {
  countData: [],
}
const DashboardContext = createContext<DashboardContextProps>({
  ...initState,
  refreshCountData: () => null,
})

const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [state, setState] = useState(initState)

  function refreshCountData() {
    void getDataFromServer()
  }
  const getDataFromServer = useCallback(async () => {
    try {
      const baseQuery = (type: AnnouncementProps["type"]) =>
        query(collection(db, "announcement"), where("type", "==", type))
      const memo = await getCountFromServer(baseQuery("university_memorandum"))
      const event = await getCountFromServer(baseQuery("event"))
      const others = await getCountFromServer(baseQuery("others"))
      const recognition = await getCountFromServer(baseQuery("recognition"))
      const result = [
        {
          name: "university_memorandum" as AnnouncementProps["type"],
          count: memo.data().count,
        },
        {
          name: "event" as AnnouncementProps["type"],
          count: event.data().count,
        },
        {
          name: "others" as AnnouncementProps["type"],
          count: others.data().count,
        },
        {
          name: "recognition" as AnnouncementProps["type"],
          count: recognition.data().count,
        },
      ]
      setState({ countData: result })
    } catch (err) {
      console.log(err)
    }
  }, [])

  useEffect(() => {
    return void getDataFromServer()
  }, [getDataFromServer])

  return (
    <DashboardContext.Provider value={{ ...state, refreshCountData }}>
      {children}
    </DashboardContext.Provider>
  )
}

export type {
  DashboardStateProps,
  DashboardContextProps,
  DashboardProviderProps,
}
export const useDashboard = () => useContext(DashboardContext)
export default DashboardProvider
