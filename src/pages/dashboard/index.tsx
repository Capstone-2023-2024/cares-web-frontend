import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";

const Dashboard = () => {
  const { currentUser, signout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    void signout();
  }

  useEffect(() => {
    if (currentUser === null) {
      router.replace("login");
    }
  }, [currentUser]);

  return currentUser === null ? (
    <div className="flex h-screen items-center justify-center">
      <Loading />
    </div>
  ) : (
    <Main>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="capitalize">
          account:
          <span className="font-bold lowercase">{` ${currentUser?.email}`}</span>
        </p>
        <button
          className="rounded-xl bg-red-500 p-2 capitalize text-white"
          onClick={handleLogout}
        >
          logout
        </button>
      </div>
    </Main>
  );
};

export default Dashboard;
