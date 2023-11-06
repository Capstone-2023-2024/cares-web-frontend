import { collection, limit, onSnapshot, query } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db } from "~/utils/firebase";

interface OptionsProps {
  name: string;
  value: number;
}

export interface PollProps {
  id: string;
  dateCreated: number;
  dateOfExpiration: number;
  options: Partial<OptionsProps>[];
  question: string;
  state: "published" | "unpublished";
  type: "poll";
}
interface PollStateProps extends Pick<PollProps, "state"> {
  polls: PollProps[];
}
// interface PollContextProps extends PollStateProps {}

const initState: PollStateProps = {
  polls: [],
  state: "unpublished",
};

const ProjectContext = createContext<PollStateProps>({
  ...initState,
});

const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initState);

  useEffect(() => {
    const limitNumber = 15;
    const pollQuery = query(
      collection(db, "project_suggestion"),
      limit(limitNumber)
    );
    const unsub = onSnapshot(pollQuery, (snapshot) => {
      const polls: PollProps[] = [];
      snapshot.docs.forEach((doc) => {
        const id = doc.id;
        const data = doc.data() as Omit<PollProps, "id">;
        const holder = {
          ...data,
          id,
        };
        polls.push(holder);
      });
      setState((prevState) => ({ ...prevState, polls }));
    });
    return unsub;
  }, []);

  return (
    <ProjectContext.Provider value={{ ...state }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
export default ProjectProvider;
