# This is a React development to be port in react-native

# Changelog:

- [FIXED]: Complaint Box UI conflicting with class_section ChatHeadButton
- [FIXED]: `adviser` is not sharing components with `student`
- [REMOVED]: Hero UI in rendering ComplaintBox's complaints [CHANGED]: selected Ticket is highlighted
- [FIXED]: Duplicate groupComplaints onSnapshot
- [FIXED]: `adviser`'s class section Complaint box UI is not update when sending message
- [FIXED]: (`student`/`mayor`)'s new complaint UI is not reflected in Complaint box.
- [FIXED]: `adviser` is not yet recognized in `mayor`'s UI
- `adviser`'s UI is now implemented
- Action buttons(`resolved` and `turn-over`) are now added
- UI Updated, moved class mates into student follow-up set-up for reference in various student ids
- removed unnecessary components in development
- `student` and `mayor` flow done.

# Issues:

- Nothingggg!

# For improvements

- Turn Over Modal UI
- Optimize Firestore Read and Write(s)
- Resolved Concerns centralized in one container
- `adviser` and potentially Deleted User has the same render in UI
- Cache students
- Remove chat heads if there are no complaints
- Add notifications see TODO's
- Move resolved complaints to another clickable

# Context Provider Boilerplate

```
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface UniversalProviderStateProps {}
const universalInitState: UniversalProviderStateProps = {};
interface UniversalContextProps extends UniversalProviderStateProps {
  //   setOtherUniversal: () => void;
}
interface UniversalProviderProps {
  children: ReactNode;
}
const UniversalContext = createContext<UniversalContextProps>({
  ...universalInitState,
});

const UniversalProvider = ({ children }: UniversalProviderProps) => {
  const [state, setState] = useState(universalInitState);

  return (
    <UniversalContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </UniversalContext.Provider>
  );
};

export const useUniversal = () => useContext(UniversalContext);
export default UniversalProvider;
```
