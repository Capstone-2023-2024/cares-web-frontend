import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { projectName } from "~/utils/names";
import Header from "../Header/Header";
import HeaderPath from "../HeaderPath";
import Nav from "../Nav/Nav";
import type { MainType } from "./types";

const Main = ({ children, withPathName, ...rest }: MainType) => {
  const { currentUser, typeOfAccount, signout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function setUp() {
      if (typeOfAccount === null) {
        void signout();
        alert("You do not have any admin privileges");
        router.replace("/login");
      }
      if (currentUser === null) {
        router.replace("/login");
      }
    }
    return setUp()
  }, [currentUser]);

  return (
    <div>
      <Head>
        <title>{projectName.toUpperCase()}</title>
        <link rel="ico" href="/favicon.ico" />
      </Head>
      <Header />
      {typeOfAccount !== null && (
        <div className="flex h-full min-h-screen ">
          <Nav />
          <div className="inline-block w-2/3">
            {withPathName && <HeaderPath {...rest} />}
            <div className=" text-charcoal">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
