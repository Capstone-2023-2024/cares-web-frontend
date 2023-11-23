import { useRouter } from "next/router";
import { useToggle } from "~/contexts/ToggleProvider";
import type { HeaderPathProps } from "./types";
import Image from "next/image";

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
      <div className="flex items-center justify-center">
        <Image
          src="/announcement.png"
          alt="Announcement"
          width={240} // Adjust the width as needed
          height={240} // Adjust the height as needed
          className=" ml-5" // Add margin to the right for spacing
        />
      </div>
      {pathname === "/announcements" && (
        <button
          onClick={handleCalendar}
          className="border-1 rounded-lg border  border-gray-500 p-2 pl-6 pr-6 duration-300 ease-in-out hover:bg-primary hover:text-paper"
        >
          {showCalendar ? "CALENDAR" : "POST"}
        </button>
      )}
    </div>
  );
};

export default HeaderPath;
