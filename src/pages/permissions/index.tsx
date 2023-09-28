import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";
import { db, validateEmail } from "~/utils/firebase";
import type {
  AddRoleProps,
  AddRoleValueType,
  HomeStateProps,
  HomeStatePropsType,
  PermissionWithDateProps,
  RoleModalProps,
  RoleModalPropsType,
  RoleSelectionProps,
  RoleType,
} from "./types";

const initialProps: HomeStateProps = {
  permissionArray: [],
  isEditEnabled: false,
  deleteModal: false,
  deleteConfirmation: "",
};

const adminColRef = collection(db, "permission");
const Permission = () => {
  const ADMIN_EMAIL = "admin@cares.com";
  const { currentUser } = useAuth();
  const [state, setState] = useState(initialProps);
  const isStateHasNoContent = state.permissionArray.length === 0;
  const router = useRouter();

  function handleState(key: keyof HomeStateProps, value: HomeStatePropsType) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function handleToggleEdit() {
    handleState("isEditEnabled", !state.isEditEnabled);
  }

  function handleSelection(
    e: ChangeEvent<HTMLSelectElement>,
    id?: string
  ): void {
    e.preventDefault();
    if (typeof id === "string") {
      const role = e.target.value as RoleType;
      async function changeRole() {
        try {
          const docRef = doc(adminColRef, id);
          await updateDoc(docRef, {
            role,
            dateModified: new Date().getTime(),
          });
        } catch (err) {
          const error = err as Error;
          return console.log(error.message);
        }
      }
      return void changeRole();
    }
  }

  function toggleDelete() {
    handleState("deleteModal", true);
    // Pass Email and ID from the mapped source
  }

  useEffect(() => {
    const unsub = onSnapshot(
      query(adminColRef, orderBy("dateAdded", "desc")),
      (snapshot) => {
        const placeholder: PermissionWithDateProps[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<PermissionWithDateProps, "id">;
          const id = doc.id;
          placeholder.push({ ...data, id });
        });
        handleState("permissionArray", placeholder);
      }
    );
    return () => {
      currentUser === null ? router.push("/login") : unsub();
    };
  });

  return (
    <Main>
      <>
        {currentUser?.email === ADMIN_EMAIL && (
          <>
            <AddRole />
            <div>
              <button
                className={`${
                  isStateHasNoContent
                    ? "bg-slate-200 text-slate-400"
                    : "bg-blue-300 text-black"
                } rounded-xl p-2 capitalize`}
                onClick={handleToggleEdit}
                disabled={isStateHasNoContent}
              >
                edit
              </button>
              <table className="w-full">
                <thead className="capitalize">
                  <tr>
                    <th>email</th>
                    <th>role</th>
                    <th>date added</th>
                    <th>date modified</th>
                    <th>delete</th>
                  </tr>
                </thead>
                <tbody>
                  {state.permissionArray.map(
                    ({ email, role, dateAdded, dateModified, id }) => {
                      const DIMENSION = 40;
                      const date = () => new Date();
                      const added = date();
                      const modified = date();
                      added.setTime(dateAdded);
                      typeof dateModified === "number" &&
                        modified.setTime(dateModified);
                      const addedDateToString = `${added.toDateString()}${added.toLocaleTimeString()}`;
                      const modifiedDateToString = `${modified.toDateString()}${modified.toLocaleTimeString()}`;

                      return (
                        <tr
                          key={id}
                          className="border text-center odd:bg-slate-100"
                        >
                          <td>{email}</td>
                          <RoleSelection
                            role={role}
                            disabled={!state.isEditEnabled}
                            handleSelection={(e) => handleSelection(e, id)}
                          />
                          <td>{addedDateToString}</td>
                          <td>
                            {dateModified === null
                              ? "N/A"
                              : modifiedDateToString}
                          </td>
                          <td>
                            <button
                              onClick={toggleDelete}
                              className={`${
                                state.isEditEnabled
                                  ? "bg-red-500"
                                  : "bg-slate-200"
                              } h-6 w-6 rounded-full p-2`}
                              disabled={!state.isEditEnabled}
                            >
                              x
                              {/* <Image
                                alt="delete_icon"
                                className={`${
                                  state.isEditEnabled
                                    ? "opacity-100"
                                    : "opacity-25"
                                } h-full w-full`}
                                src="/icons8-delete.svg"
                                width={DIMENSION}
                                height={DIMENSION}
                              /> */}
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    </Main>
  );
};

const AddRole = () => {
  const initialProps: AddRoleProps = {
    isModalShowing: false,
  };
  const [state, setState] = useState(initialProps);

  function handleState(key: keyof AddRoleProps, value: AddRoleValueType) {
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
      {state.isModalShowing && <RoleModal />}
    </div>
  );
};

const RoleModal = () => {
  const initialRole: RoleType = "admin_1";
  const initialProps = {
    email: "",
    role: initialRole,
  };
  const [{ role, email }, setState] = useState(initialProps);

  function handleState(key: keyof RoleModalProps, value: RoleModalPropsType) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    handleState("email", e.target.value);
  }

  function handleSelection(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    handleState("role", e.target.value as RoleType);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (!validateEmail(email)) {
        return alert("invalid email");
      }
      if (email.trim() !== "") {
        const perm: Omit<PermissionWithDateProps, "id"> = {
          email,
          role,
          dateAdded: new Date().getTime(),
          dateModified: null,
        };
        const adminQueryRef = query(adminColRef, where("email", "==", email));
        const snapshot = await getDocs(adminQueryRef);
        if (snapshot.empty) {
          await addDoc(adminColRef, perm);
          await addDoc(collection(db, "faculty"), { email: perm.email });
        } else {
          alert("User already exist!");
        }
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
      <h2>Add Role:</h2>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="flex items-center gap-2">
          <h2>Role: </h2>
          <RoleSelection {...{ role, handleSelection }} />
        </div>
        <input
          required
          className={`${validateEmail(email) ? 'border-green-500' : email === '' ? 'border-slate-300' : 'border-red-500'} rounded-lg border p-4 shadow-sm outline-none duration-300 ease-in-out`}
          value={email}
          onChange={handleChange}
          placeholder="Enter a email to add"
        />
        <button className="rounded-xl bg-blue-300 p-2" type="submit">
          Add email
        </button>
      </form>
    </div>
  );
};
const RoleSelection = ({
  role,
  handleSelection,
  ...rest
}: RoleSelectionProps) => {
  const roleOptions: { role: RoleType }[] = [
    { role: "admin_1" },
    { role: "admin_2" },
    { role: "admin_3" },
    { role: "faculty" },
  ];
  return (
    <select
      required
      {...rest}
      value={role}
      className="rounded-xl p-2 capitalize"
      onChange={handleSelection}
    >
      {roleOptions.map(({ role }) => {
        return (
          <option key={role} value={role}>
            {role.replace(/_/g, " ")}
          </option>
        );
      })}
    </select>
  );
};

export default Permission;
