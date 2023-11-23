import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import { db } from "../../utils/firebase"
import type {
  ChatContextProps,
  ChatProviderProps,
  InitialProps,
  PeopleProps,
  RegisteredPeopleProps,
  StateType,
} from "./types"

const initialProps: InitialProps = {
  people: [],
  registered: [],
}
const ChatContext = createContext<ChatContextProps>({
  ...initialProps,
})

const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, setState] = useState(initialProps)
  const queryRef = query(
    collection(db, "people"),
    orderBy("dateUpdated", "desc")
  )

  function handleState(key: keyof InitialProps, value: StateType) {
    setState((prevState) => ({ ...prevState, [key]: value }))
  }

  useEffect(() => {
    const unsub = onSnapshot(queryRef, (snapshot) => {
      const placeholder: PeopleProps[] = []
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          const id = doc.id
          const data = doc.data() as Omit<PeopleProps, "id">
          placeholder.push({ id, ...data })
        })

        handleState("people", placeholder)
      }
    })
    return () => unsub()
  }, [queryRef])

  useEffect(() => {
    const contactColRef = collection(db, "registered")
    const contactQuery = query(contactColRef)

    function iterateSnapshot(
      snapshot: QuerySnapshot<DocumentData, DocumentData>
    ) {
      const placeholder: RegisteredPeopleProps[] = []
      snapshot.forEach((doc) => {
        const id = doc.id
        const data = doc.data() as Omit<RegisteredPeopleProps, "id">
        placeholder.push({ ...data, id })
      })
      localStorage.setItem("registered", JSON.stringify(placeholder))
      const reparseLocalRegPeople = JSON.parse(
        localStorage.getItem("registered") ?? ""
      ) as RegisteredPeopleProps[]
      handleState("registered", reparseLocalRegPeople)
    }

    const unsub = async () => {
      const snapshot = await getDocs(contactQuery)
      const localRegisteredPeople = localStorage.getItem("registered")
      if (localRegisteredPeople === null) {
        console.log("Initializing Local Cache")
        iterateSnapshot(snapshot)
      } else {
        const parsedLocalRegPeople = JSON.parse(
          localRegisteredPeople
        ) as RegisteredPeopleProps[]
        if (parsedLocalRegPeople.length === snapshot.size) {
          console.log("Same size")
          return handleState("registered", parsedLocalRegPeople)
        }
        console.log("Reparsing")
        iterateSnapshot(snapshot)
      }
    }
    return void unsub()
  }, [])

  return (
    <ChatContext.Provider value={{ ...state }}>{children}</ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
export default ChatProvider
