import { formatDateOrMonth, setUpPrefix } from "@cares/utils/date";

function handleEditedCreatedDates(created: number, edited?: number) {
  const dateHolder = new Date();
  const createdDate = new Date();
  dateHolder.setTime(Number(edited));
  createdDate.setTime(created);
  const editedDate =
    typeof edited === "number"
      ? setUpPrefix(dateHolder).replace(/,/, "")
      : edited ?? "N/A";
  return { createdDate, editedDate };
}

function markedDatesHandler(
  selectedDateArray: number[],
  year: number,
  month: number,
) {
  return selectedDateArray.map(
    (value) =>
      `${year}-${formatDateOrMonth(month + 1)}-${formatDateOrMonth(value)}`,
  );
}

export { markedDatesHandler, handleEditedCreatedDates };
