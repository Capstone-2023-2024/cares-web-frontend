import { addDoc, getDocs, query, where } from "firebase/firestore";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { RoleModalProps, RoleModalPropsValue } from "~/types/permissions";
import { permissionColRef, validateEmail } from "~/utils/firebase";
import { roleOptions } from "~/utils/roles";
import type { RoleProps } from "~/utils/roles/types";
import AccessLevelSelection from "../AccessLevelSelection";
import RoleSelection from "../RoleSelection";
import type { PermissionWithDateProps } from "./types";

const RoleModal = () => {
  const initialRole: RoleProps = {
    title: "admin_1",
    access_level: { name: "super_admin", partial: false },
  };
  const initialProps = {
    email: "",
    role: initialRole,
  };
  const [state, setState] = useState(initialProps);

  function handleState(key: keyof RoleModalProps, value: RoleModalPropsValue) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    handleState("email", e.target.value);
  }

  function handleRoleSelection(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    const roleTitle = e.target.value;
    const role = roleOptions.filter(({ title }) => roleTitle === title)[0];
    if (role !== undefined) {
      handleState("role", role);
    }
  }

  function handleAccessLevelSelection(e: ChangeEvent<HTMLSelectElement>): void {
    e.preventDefault();
    const partial_access = JSON.parse(e.target.value) as boolean;
    const newRole = { ...state.role };
    const access_level = { ...newRole.access_level, partial: partial_access };
    const role = { ...newRole, access_level };
    setState((prevState) => ({ ...prevState, role }));
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
          roleInString: state.role.title,
          dateAdded: new Date().getTime(),
          dateModified: null,
        };
        const adminQueryRef = query(
          permissionColRef,
          where("email", "==", state.email)
        );
        const snapshot = await getDocs(adminQueryRef);
        if (snapshot.empty) {
          await addDoc(permissionColRef, perm);
        } else {
          alert("User already exist!");
        }
        handleState("role", initialRole);
        return handleState("email", "");
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
        <div className="flex items-center gap-2">
          <h2>Role: </h2>
          <RoleSelection
            role={state.role}
            handleRoleSelection={handleRoleSelection}
          />
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
