import { useState } from "react";
import type { AddRoleProps, AddRoleValue, AddUserProps } from "./types";

const AddUser = ({ children }: AddUserProps) => {
  const initialProps: AddRoleProps = {
    isModalShowing: false,
  };
  const [state, setState] = useState(initialProps);

  function handleState(key: keyof AddRoleProps, value: AddRoleValue) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }
  function handleAddRole(value: boolean) {
    handleState("isModalShowing", value);
  }

  return (
    <div className="gap-2 rounded-xl border p-2">
      <div className="grid grid-flow-col">
        <button
          type="button"
          className="rounded-xl bg-slate-100 p-2 shadow-sm"
          onClick={() => handleAddRole(!state.isModalShowing)}
        >
          {state.isModalShowing ? "Collapse" : "Expand"}
        </button>
      </div>
      {state.isModalShowing && children}
    </div>
  );
};

export default AddUser;
