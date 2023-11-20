import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";

export interface ContentManipulationProviderStateProps {
  selectedChatId: string | null;
  selectedStudent: string | null;
  selectedChatHead:
    | "adviser"
    | "class_section"
    | "students"
    | "program_chair"
    | "board_member"
    | "mayor"
    | null;
  currentYearSectionComplaintDocId: string | null;
}
const contentManupulationInitState: ContentManipulationProviderStateProps = {
  selectedChatId: null,
  selectedStudent: null,
  selectedChatHead: null,
  currentYearSectionComplaintDocId: null,
};
interface ContentManipulationContextProps
  extends ContentManipulationProviderStateProps {
  setSelectedChatId: (value: string | null) => void;
  setSelectedStudent: (value: string | null) => void;
  setSelectedChatHead: (
    value: ContentManipulationProviderStateProps["selectedChatHead"]
  ) => void;
  setCurrentYearSectionComplaintDocId: (value: string | null) => void;
}
interface ContentManipulationProviderProps {
  children: ReactNode;
}
const ContentManipulationContext =
  createContext<ContentManipulationContextProps>({
    ...contentManupulationInitState,
    setSelectedChatId: () => null,
    setSelectedStudent: () => null,
    setSelectedChatHead: () => null,
    setCurrentYearSectionComplaintDocId: () => null,
  });

const ContentManipulationProvider = ({
  children,
}: ContentManipulationProviderProps) => {
  const [state, setState] = useState(contentManupulationInitState);
  console.log({ rest: state });
  const setSelectedChatId = useCallback(
    (selectedChatId: string | null) =>
      setState((prevState) => ({ ...prevState, selectedChatId })),
    []
  );
  const setSelectedStudent = useCallback(
    (selectedStudent: string | null) =>
      setState((prevState) => ({ ...prevState, selectedStudent })),
    []
  );
  const setSelectedChatHead = useCallback(
    (
      selectedChatHead: ContentManipulationProviderStateProps["selectedChatHead"]
    ) => setState((prevState) => ({ ...prevState, selectedChatHead })),
    []
  );
  const setCurrentYearSectionComplaintDocId = useCallback(
    (currentYearSectionComplaintDocId: string | null) =>
      setState((prevState) => ({
        ...prevState,
        currentYearSectionComplaintDocId,
      })),
    []
  );

  return (
    <ContentManipulationContext.Provider
      value={{
        ...state,
        setSelectedChatId,
        setSelectedStudent,
        setSelectedChatHead,
        setCurrentYearSectionComplaintDocId,
      }}
    >
      {children}
    </ContentManipulationContext.Provider>
  );
};

/** Collection of changable data inside Complaints */
export const useContentManipulation = () =>
  useContext(ContentManipulationContext);
export default ContentManipulationProvider;
