import {
  and,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  type ChangeEvent,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AnnouncementProps } from "~/types/announcement";
import { db } from "~/utils/firebase";
import type {
  AnnouncementContextProps,
  AnnouncementProviderProps,
  AnnouncementStateProps,
} from "./types";

const initState: AnnouncementStateProps = {
  tag: "",
  orderBy: "asc",
  type: "event",
  data: [],
};
const AnnouncementContext = createContext<AnnouncementContextProps>({
  ...initState,
  handleTypeChange: () => null,
  handleOrderBy: () => null,
  handleTag: () => null,
});

const AnnouncementProvider = ({ children }: AnnouncementProviderProps) => {
  const [state, setState] = useState(initState);

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as AnnouncementStateProps["type"];
    setState((prevState) => ({ ...prevState, type }));
  }
  function handleOrderBy(event: ChangeEvent<HTMLSelectElement>) {
    const orderBy = event.target.value as AnnouncementStateProps["orderBy"];
    setState((prevState) => ({ ...prevState, orderBy }));
  }
  function handleTag(event: ChangeEvent<HTMLInputElement>) {
    const tag = event.target.value;
    setState((prevState) => ({ ...prevState, tag }));
  }

  console.log({ state });
  useEffect(() => {
    const limitNumber = 10;
    const eventRecognitionQuery = query(
      collection(db, "announcement"),
      and(
        where("type", "==", state.type),
        where("endDate", ">", new Date().getTime())
      ),
      orderBy("endDate", state.orderBy),
      limit(limitNumber)
    );
    const eventRecognitionWithTagsQuery = query(
      collection(db, "announcement"),
      and(
        where("type", "==", state.type),
        where("tags", "array-contains", state.tag.toLowerCase()),
        where("endDate", ">", new Date().getTime())
      ),
      orderBy("endDate", state.orderBy),
      limit(limitNumber)
    );
    const memoQuery = query(
      collection(db, "announcement"),
      where("type", "==", state.type),
      orderBy("dateCreated", state.orderBy),
      limit(limitNumber)
    );
    const memoWithTagsQuery = query(
      collection(db, "announcement"),
      and(
        where("type", "==", state.type),
        where("tags", "array-contains", state.tag.toLowerCase())
      ),
      orderBy("dateCreated", state.orderBy),
      limit(limitNumber)
    );
    const unsub = onSnapshot(
      state.type === "university_memorandum" && state.tag.trim() !== ""
        ? memoWithTagsQuery
        : state.type === "university_memorandum" && state.tag.trim() === ""
        ? memoQuery
        : state.tag.trim() !== ""
        ? eventRecognitionWithTagsQuery
        : eventRecognitionQuery,
      (snapshot) => {
        const placeholder: AnnouncementProps[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;
          placeholder.push({
            ...data,
            id,
          } as AnnouncementProps);
        });
        const data = placeholder;
        setState((prevState) => ({ ...prevState, data }));
      }
    );
    return unsub;
  }, [state.orderBy, state.type, state.tag]);

  return (
    <AnnouncementContext.Provider
      value={{ ...state, handleTypeChange, handleOrderBy, handleTag }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => useContext(AnnouncementContext);
export default AnnouncementProvider;
