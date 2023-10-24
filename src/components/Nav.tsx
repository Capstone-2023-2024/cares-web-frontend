import Image from "next/image";
import Link from "next/link";
import { useAuth } from "~/contexts/AuthContext";

interface PathType {
  pathname: string;
  iconSrc?: string;
}

const Nav = () => {
  const { signout } = useAuth();
  function handleLogout() {
    void signout();
  }

  return (
    <nav className="inline-block w-1/3 bg-secondary p-2 text-paper">
      <h2 className="font-bold">MENU</h2>
      <ul className="m-0 list-none p-0">
        <Path pathname="about" />
        <Path pathname="announcements" />
        <Path pathname="complaints" />
        <Path pathname="dashboard" />
        <Path pathname="mayor" />
        <Path pathname="permissions" />
        <Path pathname="project_suggestion" />
        <button
          className="fixed bottom-2 left-2 rounded-xl bg-red-500 p-2 capitalize text-white"
          onClick={handleLogout}
        >
          logout
        </button>
      </ul>
    </nav>
  );
};

const Path = ({ iconSrc, pathname }: PathType) => {
  function renderIcon() {
    return iconSrc ? (
      <Image alt="" className="h-full w-full" src={iconSrc} />
    ) : (
      <p className="text-xs">icon</p>
    );
  }

  return (
    <li className="flex cursor-pointer items-center justify-start gap-2 p-2 capitalize">
      {renderIcon()}
      <Link passHref href={`/${pathname.toLowerCase()}`}>
        {pathname.replace(/_/g, " ")}
      </Link>
    </li>
  );
};

export default Nav;
