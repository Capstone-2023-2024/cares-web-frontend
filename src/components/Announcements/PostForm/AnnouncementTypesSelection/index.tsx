import { typesOfAnnouncement } from "~/utils/announcement";
import type { AnnouncementTypesSelectionProps } from "./types";

const AnnouncementTypesSelection = (props: AnnouncementTypesSelectionProps) => {
  return (
    <select
      {...props}
      className="w-full rounded-lg bg-primary p-2 pl-10 pr-14 text-center capitalize text-paper"
    >
      {typesOfAnnouncement.map(({ name, type }) => {
        return (
          <option key={type} value={type}>
            {name.replace(/_/g, " ")}
          </option>
        );
      })}
    </select>
  );
};

export default AnnouncementTypesSelection;
