import type { MarkedDatesProps } from "@cares/types/announcement";
import { formatDateOrMonth, setUpPrefix } from "@cares/utils/date";
import { removeObjectWithType } from "@cares/utils/validation";

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
  markedDatesProps: MarkedDatesProps,
): Record<string, Omit<MarkedDatesProps, "calendar">> {
  const { textColor, color, dotColor } = markedDatesProps;
  const restProps = { textColor, color, dotColor };
  let markedDatesHolder: Record<
    string,
    Omit<MarkedDatesProps, "calendar">
  > = {};
  selectedDateArray.map((value) => {
    const monthFormatted = formatDateOrMonth(month + 1);
    const dateFormatted = formatDateOrMonth(value);
    const objectName = `${year}-${monthFormatted}-${dateFormatted}`;
    markedDatesHolder = Object.assign(
      { [objectName]: removeObjectWithType(restProps, "value", undefined) },
      markedDatesHolder,
    );
  });
  return markedDatesHolder;
}

export { handleEditedCreatedDates, markedDatesHandler };
