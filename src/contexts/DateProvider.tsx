import { weekNames } from "@cares/utils/date"
import { createContext, useContext, useState, type ReactNode } from "react"

interface initialDateType {
  date: number
  month: number
  year: number
  weekName?: (typeof weekNames)[number]
  selectedDateArray: number[]
}
interface DateContextType extends initialDateType {
  changeDate: (date: number) => void
  changeMonth: (month: number) => void
  changeYear: (year: number) => void
  changeWeek: (weekName: typeof weekNames) => void
  changeSelectedDateArray: (dateArray: number[]) => void
}
interface DateProviderType {
  children: ReactNode
}

const initDate = new Date()
const day = initDate.getDay()
const initialDate: initialDateType = {
  date: initDate.getDate(),
  month: initDate.getMonth(),
  year: initDate.getFullYear(),
  weekName: weekNames[day],
  selectedDateArray: [],
}

const DateContext = createContext<DateContextType>({
  ...initialDate,
  changeDate: () => null,
  changeMonth: () => null,
  changeYear: () => null,
  changeWeek: () => null,
  changeSelectedDateArray: () => null,
})

const DateProvider = ({ children }: DateProviderType) => {
  const [state, setState] = useState(initialDate)

  const values = {
    ...state,
    changeDate,
    changeMonth,
    changeYear,
    changeWeek,
    changeSelectedDateArray,
  }

  function handleState(
    name: keyof initialDateType,
    value: number | typeof weekNames | number[]
  ) {
    setState((previousState) => ({ ...previousState, [name]: value }))
  }
  function changeDate(date: number) {
    handleState("date", date)
  }
  function changeMonth(month: number) {
    handleState("month", month)
  }
  function changeYear(year: number) {
    handleState("year", year)
  }
  function changeWeek(weekName: typeof weekNames) {
    handleState("weekName", weekName)
  }
  function changeSelectedDateArray(dateArray: number[]) {
    handleState("selectedDateArray", dateArray)
  }

  return <DateContext.Provider value={values}>{children}</DateContext.Provider>
}

export type { initialDateType, DateContextType, DateProviderType }
export const useDate = () => useContext(DateContext)
export default DateProvider
