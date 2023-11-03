import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { PathType } from "./types";

const Nav = () => {
  return (
    <nav className="inline-block w-2/6 bg-secondary p-2 text-paper">
      <h2 className="font-bold">MENU</h2>
      <ul className="m-0 list-none p-0 duration-300 ease-in-out">
        {/* <Path pathname="about" /> */}
        <Path iconSrc="/megaphone.png" pathname="announcements" />
        <Path iconSrc="/question.png" pathname="complaints" />
        <Path iconSrc="/dashboard.png" pathname="dashboard" />
        <Path iconSrc="/hierarchy.png" pathname="permissions" />
        <Path iconSrc="/suggestion.png" pathname="project_suggestion" />
      </ul>
    </nav>
  );
};

const Path = ({ iconSrc, pathname }: PathType) => {
  const router = useRouter();
  const path = router.pathname;
  const currentPath = path.substring(1, path.length);

  function renderIcon() {
    const DIMENSION = 20;
    return iconSrc ? (
      <Image
        alt=""
        width={DIMENSION}
        height={DIMENSION}
        className={`${
          currentPath === pathname
            ? ""
            : "brightness-125 contrast-100 hue-rotate-[354deg] invert saturate-100 sepia-[.25] filter"
        } h-6 w-6`}
        src={iconSrc}
      />
    ) : (
      <p className="text-xs">icon</p>
    );
  }

  return (
    <li
      className={`${
        currentPath === pathname ? "bg-paper text-black" : "text-white "
      } flex cursor-pointer items-center justify-start gap-2 p-2 capitalize`}
    >
      {renderIcon()}
      <Link passHref href={`/${pathname.toLowerCase()}`}>
        {pathname.replace(/_/g, " ")}
      </Link>
    </li>
  );
};

export default Nav;
