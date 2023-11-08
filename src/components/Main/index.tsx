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
    async function setUp() {
      try {
        if (typeOfAccount === null) {
          alert("You do not have any admin privileges");
          await signout();
          await router.replace("/login");
        }
        if (currentUser === null) {
          await router.replace("/login");
        }
      } catch (err) {
        console.log(err);
      }
    }
    return void setUp();
  }, [currentUser, router, signout, typeOfAccount]);

  return (
    <div>
      <Head>
        <title>{projectName.toUpperCase()}</title>
        <link rel="ico" href="/favicon.ico" />
      </Head>
      <Header />
      {typeOfAccount !== null && (
        <div className="flex flex-1">
          <Nav />
          <div className="w-full sm:w-2/3">
            {withPathName && <HeaderPath {...rest} />}
            <div>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
