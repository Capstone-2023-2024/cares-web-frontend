import type { FirestoreDatabaseProps } from "@cares/types/document";
import type {
  AdviserInfoProps,
  ClassSectionProps,
  FacultyInfoProps,
  MayorInfoProps,
  StudentInfoProps,
} from "@cares/types/user";
import { roleOptions } from "@cares/utils/admin";
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState, type ChangeEvent, type MouseEvent } from "react";
import ActionButton from "~/components/Actionbutton";
import Main from "~/components/Main";
import {
  AccessLevelSelection,
  AddUser,
  RoleModal,
} from "~/components/Permissions";
import type { PermissionWithDateProps } from "~/components/Permissions/RoleModal/types";
import RoleSelection from "~/components/Permissions/RoleSelection";
import SectionContainer from "~/components/Permissions/SectionContainer";
import Selection from "~/components/Permissions/Selection";
import { useAuth } from "~/contexts/AuthProvider";
import { db, getCollection } from "~/utils/firebase";

interface ReadStudentInfoProps
  extends StudentInfoProps,
    FirestoreDatabaseProps {}
interface ReadAdviserInfoProps
  extends AdviserInfoProps,
    FirestoreDatabaseProps {}
interface ReadFacultyInfoProps
  extends FacultyInfoProps,
    FirestoreDatabaseProps {}
interface ReadMayorInfoProps extends MayorInfoProps, FirestoreDatabaseProps {}

interface AssignAdviserStateProps extends ClassSectionProps {
  adviser: ReadAdviserInfoProps[];
  faculty: ReadFacultyInfoProps[];
  selectedFaculty: string | null;
}
interface AssignMayorStateProps extends ClassSectionProps {
  mayors: ReadMayorInfoProps[];
  selectedMayor: string | null;
  studentsWithSection: ReadStudentInfoProps[];
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

const Permission = () => {
  const { typeOfAccount } = useAuth();
  return (
    <Main>
      {typeOfAccount === "super_admin" && <AssignAdmin />}
      {typeOfAccount === "program_chair" && <AssignAdviser />}
      {typeOfAccount === "board_member" && <AssignMayor />}
    </Main>
  );
};

interface InitialStateProps {
  permissionArray: PermissionWithDateProps[];
  toggleEdit: string;
}

const AssignAdmin = () => {
  const initialProps: InitialStateProps = {
    permissionArray: [],
    toggleEdit: "",
  };
  const router = useRouter();
  const { currentUser } = useAuth();
  const [state, setState] = useState(initialProps);
  const isStateHasNoContent = state.permissionArray.length === 0;

  function handleToggleEdit(value: string) {
    state.toggleEdit.trim() === ""
      ? setState((prevState) => ({ ...prevState, toggleEdit: value }))
      : state.toggleEdit.trim() === value
        ? setState((prevState) => ({ ...prevState, toggleEdit: "" }))
        : setState((prevState) => ({ ...prevState, toggleEdit: value }));
  }
  async function toggleDelete(value: string) {
    try {
      await deleteDoc(doc(getCollection("permission"), value));
    } catch (err) {
      console.log(err);
    }
  }
  function handleRoleSelection(e: ChangeEvent<HTMLSelectElement>, id: string) {
    e.preventDefault();
    const roleTitle = e.target.value;
    const role = roleOptions.filter(({ name }) => roleTitle === name)[0];

    async function changeRole() {
      try {
        const docRef = doc(getCollection("permission"), id);
        await updateDoc(docRef, {
          role,
          roleInString: role?.name,
          dateEdited: new Date().getTime(),
        });
      } catch (err) {
        const error = err as Error;
        return console.log(error.message);
      }
    }

    return void changeRole();
  }
  function handleAccessLevelSelection(
    e: ChangeEvent<HTMLSelectElement>,
    id: string,
  ): void {
    e.preventDefault();
    const partial_access = JSON.parse(e.target.value) as boolean;

    async function fetchRole(
      partial_access: boolean,
      docRef: DocumentReference<DocumentData, DocumentData>,
    ) {
      const permDoc = await getDoc(docRef);
      const role = permDoc.data() as PermissionWithDateProps;
      return role;
    }

    async function changeAccessLevel() {
      try {
        const docRef = doc(getCollection("permission"), id);
        const role = await fetchRole(partial_access, docRef);
        await updateDoc(docRef, {
          role,
          dateEdited: new Date().getTime(),
        });
      } catch (err) {
        const error = err as Error;
        return console.log(error.message);
      }
    }

    return void changeAccessLevel();
  }
  const renderTableHeading = () => (
    <tr>
      <th>email</th>
      <th>title</th>
      <th>partial access</th>
      <th>date added</th>
      <th>date modified</th>
      <th>actions</th>
    </tr>
  );
  const renderTableBody = () =>
    state.permissionArray.map(
      ({ email, role, dateCreated, dateEdited, id }) => {
        const date = () => new Date();
        const added = date();
        const modified = date();
        added.setTime(dateCreated);
        typeof dateEdited === "number" && modified.setTime(dateEdited);
        const addedDateToString = added.toLocaleString();
        const modifiedDateToString = modified.toLocaleString();
        const indexCondition = state.toggleEdit === id;
        const deleteConditionalStyle = indexCondition
          ? "bg-red-500 text-paper"
          : "bg-slate-200 text-slate-300";
        const editConditionalStyle = isStateHasNoContent
          ? "bg-slate-200 text-slate-400"
          : "bg-primary/70 text-paper";

        return (
          <tr key={id} className="border text-center odd:bg-slate-100">
            <td>{email}</td>
            <td>
              <RoleSelection
                role={role}
                disabled={!indexCondition}
                handleRoleSelection={(e) => handleRoleSelection(e, id)}
              />
            </td>
            <td>
              <AccessLevelSelection
                role={role}
                disabled={!indexCondition}
                handleAccessLevelSelection={(e) =>
                  handleAccessLevelSelection(e, id)
                }
              />
            </td>
            <td>
              <p className="text-sm">{addedDateToString}</p>
            </td>
            <td>
              <p className="text-sm">
                {dateEdited === null ? "N/A" : modifiedDateToString}
              </p>
            </td>
            <td className="flex flex-row items-center justify-center">
              <button
                className={`${deleteConditionalStyle} rounded-xl p-2 capitalize duration-300 ease-in-out`}
                onClick={() => void toggleDelete(id)}
                disabled={!indexCondition}
              >
                delete
              </button>
              <button
                onClick={() => handleToggleEdit(id)}
                disabled={isStateHasNoContent}
                className={`${editConditionalStyle} rounded-xl p-2 capitalize shadow-sm duration-300 ease-in-out`}
              >
                edit
              </button>
            </td>
          </tr>
        );
      },
    );

  useEffect(() => {
    async function setup() {
      const unsub = onSnapshot(
        query(getCollection("permission"), orderBy("dateAdded", "desc")),
        (snapshot) => {
          const permissionArray: PermissionWithDateProps[] = [];
          snapshot.forEach((doc) => {
            const id = doc.id;
            const data = doc.data() as PermissionWithDateProps;
            permissionArray.push({ ...data, id });
          });
          setState((prevState) => ({
            ...prevState,
            permissionArray,
          }));
        },
      );
      try {
        if (currentUser === null) {
          return await router.push("/login");
        }
        return unsub;
      } catch (err) {
        console.log(err);
      }
    }
    return void setup();
  }, [currentUser, router]);

  return (
    <SectionContainer extensionName="admins & faculty">
      <>
        <AddUser>
          <RoleModal />
        </AddUser>
        <div>
          <table className="mt-10 w-full">
            <thead className="capitalize">{renderTableHeading()}</thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </>
    </SectionContainer>
  );
};

const AssignAdviser = () => {
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sections = ["a", "b", "c", "d", "e", "f", "g"];
  const collectionPath = "advisers";
  const initState: AssignAdviserStateProps = {
    adviser: [],
    faculty: [],
    yearLevel: "1st Year",
    section: "a",
    selectedFaculty: null,
  };
  const [state, setState] = useState(initState);

  function handleSelectedFaculty(event: ChangeEvent<HTMLSelectElement>) {
    const selectedFaculty = event.target.value;
    setState((prevState) => ({ ...prevState, selectedFaculty }));
  }
  async function handleRevoke(id: string) {
    try {
      await deleteDoc(doc(collection(db, "advisers"), id));
    } catch (err) {
      console.log(err);
    }
  }
  async function handleSubmitAdviser(e: MouseEvent<HTMLButtonElement>) {
    try {
      e.preventDefault();
      if (state.section !== undefined) {
        const section = state.section;
        const upperCaseSection = section.toUpperCase();
        const yearNumber = state.yearLevel.charAt(0);
        const adviserColRef = collection(db, collectionPath);
        const formattedSection = `${yearNumber}${upperCaseSection}`;

        if (typeof state.selectedFaculty === "string") {
          const adviserInfo: Omit<AdviserInfoProps, "name" | "id"> = {
            section: state.section,
            email: state.selectedFaculty,
            yearLevel: state?.yearLevel ?? "",
            dateCreated: new Date().getTime(),
          };

          const isRegisteredAdviser = await getDocs(
            query(adviserColRef, where("email", "==", state.selectedFaculty)),
          );
          const isSectionHasAdviser = await getDocs(
            query(
              adviserColRef,
              and(
                where("yearLevel", "==", state.yearLevel),
                where("section", "==", state.section),
              ),
            ),
          );

          if (!isRegisteredAdviser.empty) {
            return alert(`${state.selectedFaculty} is already a adviser`);
          }
          if (!isSectionHasAdviser.empty) {
            return alert(`There is already a adviser in ${formattedSection}`);
          }
          await addDoc(adviserColRef, adviserInfo);
          const yearLevel = initState.yearLevel;
          const section = initState.section;
          const selectedFaculty = initState.selectedFaculty;
          setState((prevState) => ({
            ...prevState,
            yearLevel,
            section,
            selectedFaculty,
          }));
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  const renderFaculty = () => (
    <select required defaultValue="" onChange={handleSelectedFaculty}>
      <option disabled value="">
        --
      </option>
      {state.faculty.map(({ email, name }) => {
        return (
          <option key={email} value={email}>
            {name ? name : email}
          </option>
        );
      })}
    </select>
  );
  function handleYearLevel(event: ChangeEvent<HTMLSelectElement>) {
    const yearLevel = event.target.value;
    setState((prevState) => ({ ...prevState, yearLevel }));
  }
  function handleSection(event: ChangeEvent<HTMLSelectElement>) {
    const section = event.target.value;
    if (typeof section !== "string") {
      setState((prevState) => ({ ...prevState, section }));
    }
  }
  const renderYearLevel = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Year Level:</p>
      <Selection
        value={state.yearLevel}
        onChange={handleYearLevel}
        array={yearLevels}
      />
    </div>
  );
  const renderSection = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Section:</p>
      <Selection
        value={state.section ?? ""}
        onChange={handleSection}
        array={sections}
      />
    </div>
  );
  const renderHeadings = () => (
    <tr className="border p-2">
      <th className="border p-2">
        <p>email</p>
      </th>
      <th className="border p-2">
        <p>year level</p>
      </th>
      <th className="border p-2">
        <p>section</p>
      </th>
      <th className="border p-2">
        <p>action</p>
      </th>
    </tr>
  );
  const renderAdvisers = () =>
    state.adviser.map(({ id, section, yearLevel, name, email }) => {
      return (
        <tr key={id} className="border p-2">
          <td className="border p-2">
            <p>{name ? name : email}</p>
          </td>
          <td className="border p-2">
            <p>{yearLevel}</p>
          </td>
          <td className="border p-2 capitalize">
            <p>{section}</p>
          </td>
          <td className="flex justify-center">
            <ActionButton
              onClick={() => void handleRevoke(id)}
              text="revoke"
              color="red"
            />
          </td>
        </tr>
      );
    });

  useEffect(() => {
    const adviserColRef = collection(db, collectionPath);
    const facultyColRef = collection(db, "permission");

    function getAdviser() {
      return onSnapshot(query(adviserColRef), (snapshot) => {
        const adviser: ReadAdviserInfoProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as AdviserInfoProps;
          adviser.push({ ...data, id });
        });
        setState((prevState) => ({ ...prevState, adviser }));
      });
    }
    function getFaculty() {
      return onSnapshot(
        query(facultyColRef, where("roleInString", "==", "faculty")),
        (snapshot) => {
          const faculty: ReadFacultyInfoProps[] = [];
          snapshot.forEach((doc) => {
            const id = doc.id;
            const data = doc.data() as FacultyInfoProps;
            faculty.push({ ...data, id });
          });
          setState((prevState) => ({ ...prevState, faculty }));
        },
      );
    }

    return () => {
      getAdviser();
      getFaculty();
    };
  }, []);

  return (
    <SectionContainer extensionName={collectionPath}>
      <>
        <AddUser>
          <div>
            <section>{renderYearLevel()}</section>
            <section>{renderSection()}</section>
            <section>{renderFaculty()}</section>
            <button
              onClick={(e) => void handleSubmitAdviser(e)}
              className="rounded-lg bg-primary p-2 text-white shadow-sm"
            >
              Assign
            </button>
          </div>
        </AddUser>
        <section>
          <table className="mx-auto w-5/6 border p-2">
            <thead className="capitalize">{renderHeadings()}</thead>
            <tbody>{renderAdvisers()}</tbody>
          </table>
        </section>
      </>
    </SectionContainer>
  );
};
const AssignMayor = () => {
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sections = ["a", "b", "c", "d", "e", "f", "g"];
  const initState: AssignMayorStateProps = {
    mayors: [],
    section: "a",
    yearLevel: "1st Year",
    selectedMayor: null,
    studentsWithSection: [],
  };
  const [state, setState] = useState(initState);
  const studentSectionHasContent = state.studentsWithSection.length > 0;
  const addingMayorCondition =
    studentSectionHasContent && state.selectedMayor !== null;
  const buttonConditionalStyle = addingMayorCondition
    ? "bg-primary text-white"
    : "bg-slate-200 text-slate-300";

  function handleSelectedMayor(event: ChangeEvent<HTMLSelectElement>) {
    const selectedMayor = event.target.value;
    setState((prevState) => ({ ...prevState, selectedMayor }));
  }
  async function handleRevoke(id: string, studentNo: string) {
    try {
      await deleteDoc(doc(collection(db, "mayor"), id));
      await updateDoc(doc(collection(db, "student"), studentNo), {
        recipient: "class_section",
      });
    } catch (err) {
      console.log(err);
    }
  }
  async function handleClassMayor() {
    const { yearLevel, section, selectedMayor, studentsWithSection } = state;
    const localSelected = studentsWithSection.filter(
      (student) => selectedMayor === student.studentNo,
    )[0];
    const mayorColRef = collection(db, "mayor");
    const formattedSection = `${yearLevel.charAt(0)}${section?.toUpperCase()}`;
    const mayorInfo: Omit<MayorInfoProps, "id"> = {
      name: localSelected?.name ?? "",
      email: localSelected?.email ?? "",
      studentNo: selectedMayor ?? "",
      dateCreated: new Date().getTime(),
      yearLevel,
      section: section as MayorInfoProps["section"],
    };

    try {
      const isRegisteredMayor = await getDocs(
        query(mayorColRef, where("studentNo", "==", selectedMayor)),
      );
      const isSectionHasMayor = await getDocs(
        query(
          mayorColRef,
          and(
            where("yearLevel", "==", yearLevel),
            where("section", "==", section),
          ),
        ),
      );

      if (!isRegisteredMayor.empty) {
        return alert(
          `${localSelected?.name} is already the mayor in ${formattedSection}`,
        );
      }
      if (!isSectionHasMayor.empty) {
        return alert(`There is already a mayor in ${formattedSection}`);
      }
      await addDoc(mayorColRef, mayorInfo);
      await updateDoc(doc(collection(db, "student"), mayorInfo.studentNo), {
        recipient: "bm",
      });
      setState((prevState) => ({
        ...prevState,
        yearLevel: initState.yearLevel,
        section: initState.section,
        selectedMayor: initState.selectedMayor,
      }));
    } catch (err) {
      console.log(err);
    }
  }
  function handleYearLevel(event: ChangeEvent<HTMLSelectElement>) {
    const yearLevel = event.target.value;
    setState((prevState) => ({ ...prevState, yearLevel }));
  }
  function handleSection(event: ChangeEvent<HTMLSelectElement>) {
    const section = event.target.value as ClassSectionProps["section"];
    setState((prevState) => ({ ...prevState, section }));
  }
  const renderHeadings = () => (
    <tr className="border p-2">
      <th className="border p-2">
        <p>name</p>
      </th>
      <th className="border p-2">
        <p>year level</p>
      </th>
      <th className="border p-2">
        <p>section</p>
      </th>
      <th className="border p-2">
        <p>action</p>
      </th>
    </tr>
  );
  const renderYearLevel = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Year Level:</p>
      <Selection
        value={state.yearLevel}
        onChange={handleYearLevel}
        array={yearLevels}
      />
    </div>
  );
  const renderSection = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Section:</p>
      <Selection
        value={state.section ?? "a"}
        onChange={handleSection}
        array={sections}
      />
    </div>
  );
  const renderStudentsWithSection = () => (
    <select required defaultValue="" onChange={handleSelectedMayor}>
      <option disabled value="">
        --
      </option>
      {state.studentsWithSection.map(({ studentNo, name }) => {
        return (
          <option key={studentNo} value={studentNo}>
            {name}
          </option>
        );
      })}
    </select>
  );
  const renderMayors = () =>
    state.mayors.map(({ id, studentNo, section, yearLevel, name }) => {
      return (
        <tr key={studentNo} className="border p-2">
          <td className="border p-2">
            <p>{name}</p>
          </td>
          <td className="border p-2">
            <p>{yearLevel}</p>
          </td>
          <td className="border p-2 capitalize">
            <p>{section}</p>
          </td>
          <td className="flex justify-center">
            <ActionButton
              onClick={() => void handleRevoke(id, studentNo)}
              text="revoke"
              color="red"
            />
          </td>
        </tr>
      );
    });

  useEffect(() => {
    const studentColRef = collection(db, "student");
    const studentQuery = query(
      studentColRef,
      and(
        where("section", "==", state.section),
        where("yearLevel", "==", state.yearLevel),
      ),
    );

    function getStudentWithSection() {
      return onSnapshot(studentQuery, (snapshot) => {
        const studentsWithSection: ReadStudentInfoProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as StudentInfoProps;
          studentsWithSection.push({ ...data, id });
        });
        setState((prevState) => ({ ...prevState, studentsWithSection }));
      });
    }
    return getStudentWithSection();
  }, [state.yearLevel, state.section]);
  useEffect(() => {
    const mayorColRef = collection(db, "mayor");

    function getMayors() {
      return onSnapshot(query(mayorColRef), (snapshot) => {
        const mayors: ReadMayorInfoProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as MayorInfoProps;
          mayors.push({ ...data, id });
        });
        setState((prevState) => ({ ...prevState, mayors }));
      });
    }

    return getMayors();
  }, []);

  return (
    <SectionContainer extensionName="mayors">
      <>
        <AddUser>
          <div>
            <section>{renderYearLevel()}</section>
            <section>{renderSection()}</section>
            {studentSectionHasContent && (
              <section>{renderStudentsWithSection()}</section>
            )}
            <button
              onClick={() => void handleClassMayor()}
              disabled={!addingMayorCondition}
              className={`${buttonConditionalStyle} rounded-lg p-2 capitalize shadow-sm`}
            >
              confirm
            </button>
          </div>
        </AddUser>
        <section>
          <table className="mx-auto w-5/6 border p-2">
            <thead className="capitalize">{renderHeadings()}</thead>
            <tbody>{renderMayors()}</tbody>
          </table>
        </section>
      </>
    </SectionContainer>
  );
};

export default Permission;
