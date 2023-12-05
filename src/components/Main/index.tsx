import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "~/contexts/AuthProvider";
import { projectName } from "@cares/common/utils/config";
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
    <div className="relative">
      <div className="absolute -z-10 h-screen w-full bg-[url('/bg-login.png')] bg-cover bg-no-repeat opacity-30" />
      <Head>
        <title>{projectName.toUpperCase()}</title>
        <link rel="ico" href="/favicon.ico" />
      </Head>
      <Header />
      {typeOfAccount !== null && (
        <div className="flex flex-1">
          <Nav />
          <div className="h-full min-h-screen w-full flex-1 sm:w-3/4">
            {withPathName && <HeaderPath {...rest} />}
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
