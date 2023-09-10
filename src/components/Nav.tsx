import Image from "next/image";
import Link from "next/link";

interface PathType {
  pathname: string;
  iconSrc?: string;
}

const Nav = () => {
  return (
    <nav className="inline-block w-1/3 bg-secondary p-2 text-paper">
      <h2 className="font-bold">MENU</h2>
      <ul className="m-0 list-none p-0">
        <Path pathname="dashboard" />
        <Path pathname="concerns" />
        <Path pathname="announcements" />
        <Path pathname="special_class" />
        <Path pathname="gold_gear_awards" />
        <Path pathname="about" />
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
