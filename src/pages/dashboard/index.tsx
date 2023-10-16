import React from "react";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();
  return (
    <Main>
      <div>
        <p className="capitalize">
          email:
          <span className="font-semibold lowercase">{` ${currentUser?.email}`}</span>
        </p>
      </div>
    </Main>
  );
};

export default Dashboard;
