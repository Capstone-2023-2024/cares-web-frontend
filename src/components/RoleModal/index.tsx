import type { RoleProps } from "@cares/types/permission";
import { roleOptions } from "@cares/utils/admin";
import { validateEmail } from "@cares/utils/validation";
import { addDoc, getDocs, query, where } from "firebase/firestore";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { getCollection } from "~/utils/firebase";
import AccessLevelSelection from "../AccessLevelSelection";
import RoleSelection from "../RoleSelection";
import type { PermissionWithDateProps } from "./types";

const RoleModal = () => {
  const initialRole: RoleProps = { name: "super_admin", partial: false };
  const initialProps = {
    email: "",
    role: initialRole,
  };
  const [state, setState] = useState(initialProps);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setState((prevState) => ({ ...prevState, email: e.target.value }));
  }

  function handleRoleSelection(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    const name = e.target.value;
    const role = roleOptions.filter((props) => name === props.name)[0];
    if (role !== undefined) {
      setState((prevState) => ({ ...prevState, role }));
    }
  }

  function handleAccessLevelSelection(e: ChangeEvent<HTMLSelectElement>): void {
    e.preventDefault();
    const partial_access = JSON.parse(e.target.value) as boolean;
    const newRole = { ...state.role, partial: partial_access };
    setState((prevState) => ({ ...prevState, role: newRole }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      if (!validateEmail(state.email)) {
        return alert("invalid email");
      }
      if (state.email.trim() !== "") {
        const perm: Omit<PermissionWithDateProps, "id"> = {
          email: state.email,
          role: state.role,
          dateCreated: new Date().getTime(),
        };
        const adminQueryRef = query(
          getCollection("permission"),
          where("email", "==", state.email),
        );
        const snapshot = await getDocs(adminQueryRef);
        if (snapshot.empty) {
          await addDoc(getCollection("permission"), perm);
        } else {
          alert("User already exist!");
        }
        return setState((prevState) => ({
          ...prevState,
          email: "",
          role: initialRole,
        }));
      }
      alert("Please enter a email");
    } catch (e) {
      const error = e as Error;
      console.log(`handleSubmit -> RoleModal:\n${error.message}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="flex items-center gap-2 text-lg">
          <h2>Role: &nbsp;&nbsp;</h2>
          <RoleSelection
            role={state.role}
            handleRoleSelection={handleRoleSelection}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <h2>Partial Access: </h2>
          <AccessLevelSelection
            role={state.role}
            handleAccessLevelSelection={handleAccessLevelSelection}
          />
        </div>
        <input
          required
          className={`${
            validateEmail(state.email)
              ? "border-green-500"
              : state.email === ""
                ? "border-slate-300"
                : "border-red-500"
          } rounded-lg border p-4 shadow-sm outline-none duration-300 ease-in-out`}
          value={state.email}
          onChange={handleChange}
          placeholder="Enter a email to add"
        />
        <button className="rounded-xl bg-blue-300 p-2" type="submit">
          Add User
        </button>
      </form>
    </div>
  );
};

export default RoleModal;
