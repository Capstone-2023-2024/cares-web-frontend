import { useRouter } from "next/router";
import { useToggle } from "~/contexts/ToggleContext";
import type { HeaderPathProps } from "./types";

const HeaderPath = (props: HeaderPathProps) => {
  const { pathname } = useRouter();
  const { showCalendar, toggleCalendar } = useToggle();
  const { moreThanOne } = props;

  function handleCalendar() {
    toggleCalendar();
  }

  return (
    <div
      className={`${
        moreThanOne ? "justify-between" : "justify-start"
      } flex h-min w-full items-center bg-paper p-2 shadow-md`}
    >
      <h1 className="text-2xl font-semibold capitalize text-charcoal">
        {pathname.substring(1, pathname.length).replace(/_/g, " ")}
      </h1>
      {pathname === "/announcements" && (
        <button
          onClick={handleCalendar}
          className="rounded-lg p-2 duration-300 ease-in-out hover:bg-primary hover:text-paper"
        >
          {showCalendar ? "Calendar" : "Post"}
        </button>
      )}
    </div>
  );
};

export default HeaderPath;
