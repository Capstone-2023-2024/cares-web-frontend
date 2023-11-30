import type { FirestoreDatabaseProps } from "@cares/types/document";
import type { PermissionProps, RoleProps } from "@cares/types/permission";
import type {
  AdviserInfoProps,
  ClassSectionProps,
  FacultyInfoProps,
  MayorInfoProps,
  StudentInfoProps,
} from "@cares/types/user";
import { roleOptions } from "@cares/utils/admin";
import { announcementType } from "@cares/utils/announcement";
import { setUpPrefix } from "@cares/utils/date";
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
} from "firebase/firestore";
import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import ActionButton from "~/components/Actionbutton";
import AddUser from "~/components/AddUser";
import Main from "~/components/Main";
import RoleModal from "~/components/RoleModal";
import SectionContainer from "~/components/SectionContainer";
import Selection from "~/components/Selection";
import { useAuth } from "~/contexts/AuthProvider";
import { handleEditedCreatedDates } from "~/utils/date";
import { db, getCollection } from "~/utils/firebase";

interface ReadPermissionProps extends PermissionProps, FirestoreDatabaseProps {}
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
const sharedHeadings = ["date added", "date modified", "action"];
const adviserMayorHeadings = [
  "name",
  "year level",
  "section",
  ...sharedHeadings,
];

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const sections = ["a", "b", "c", "d", "e", "f", "g"];

const RenderTableHeadings = ({ headings }: { headings: string[] }) => (
  <tr>
    {headings.map((value) => {
      return <th key={value}>{value}</th>;
    })}
  </tr>
);

const Permission = () => {
  const router = useRouter();
  const { currentUser, typeOfAccount } = useAuth();

  useEffect(() => {
    try {
      if (currentUser === null) {
        return void router.push("/login");
      }
    } catch (err) {
      console.log(err);
    }
  }, [currentUser, router]);

  return (
    <Main>
      {typeOfAccount === "super_admin" && <AssignAdmin />}
      {(typeOfAccount === "program_chair" ||
        typeOfAccount === "super_admin") && <AssignAdviser />}
      {(typeOfAccount === "board_member" ||
        typeOfAccount === "super_admin") && <AssignMayor />}
    </Main>
  );
};

interface StateProps {
  editRow: string;
  permissionArray: ReadPermissionProps[];
}

const AssignAdmin = () => {
  const adminHeadings = ["email", "title", "partial access", ...sharedHeadings];
  const [state, setState] = useState<StateProps>({
    editRow: "",
    permissionArray: [],
  });

  function handleEditRow(value: string) {
    state.editRow.trim() === ""
      ? setState((prevState) => ({ ...prevState, editRow: value }))
      : state.editRow.trim() === value
        ? setState((prevState) => ({ ...prevState, editRow: "" }))
        : setState((prevState) => ({ ...prevState, editRow: value }));
  }
  async function toggleDelete(value: string) {
    try {
      await deleteDoc(doc(getCollection("permission"), value));
    } catch (err) {
      console.log(err);
    }
  }

  async function changeRoleFromServer(
    docId: string,
    key: keyof RoleProps,
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const result = state.permissionArray.filter((props) => docId === props.id);
    if (result[0] !== undefined) {
      const { id, ...rest } = result[0];
      const holder =
        key === "name"
          ? event.target.value
          : (JSON.parse(event.target.value) as boolean);
      const role = { ...rest.role, [key]: holder };
      const data: PermissionProps = {
        ...rest,
        role,
        dateEdited: new Date().getTime(),
      };
      try {
        await updateDoc(doc(getCollection("permission"), id), { ...data });
      } catch (err) {
        console.log(err);
      }
    }
  }

  const renderTableBody = () =>
    state.permissionArray.map(
      ({ id, email, role, dateCreated, dateEdited }) => {
        const { createdDate, editedDate } = handleEditedCreatedDates(
          /*eslint-disable-next-line @typescript-eslint/no-unsafe-argument*/
          dateCreated,
          /*eslint-disable-next-line @typescript-eslint/no-unsafe-argument*/
          dateEdited,
        );

        const indexCondition = state.editRow === id;
        const deleteConditionalStyle = indexCondition
          ? "bg-red-500 text-paper"
          : "bg-slate-200 text-slate-300";
        const editConditionalStyle =
          state.permissionArray.length === 0
            ? "bg-slate-200 text-slate-400"
            : "bg-primary/70 text-paper";

        return (
          <tr key={id} className="border text-center odd:bg-slate-100">
            {/** EMAIL */}
            <td>{email}</td>
            {/** TITLE */}
            <td>
              <Selection
                value={role.name}
                options={roleOptions.map((props) => props.name)}
                disabled={!indexCondition}
                onChange={(e) => {
                  const event = e as unknown as ChangeEvent<HTMLSelectElement>;
                  void changeRoleFromServer(id, "name", event);
                }}
              />
            </td>
            {/** PARTIAL */}
            <td>
              <Selection
                value={role.partial.toString()}
                options={["true", "false"]}
                disabled={!indexCondition}
                onChange={(e) => {
                  const event = e as unknown as ChangeEvent<HTMLSelectElement>;
                  void changeRoleFromServer(id, "partial", event);
                }}
              />
            </td>
            {/** DATE CREATED */}
            <td>
              <p className="text-sm">
                {setUpPrefix(createdDate).replace(/,/, "")}
              </p>
            </td>
            {/** DATE MODIFIED */}
            <td>
              <p className="text-sm">{editedDate}</p>
            </td>
            {/** ACTIONS */}
            <td className="flex flex-row items-center justify-center">
              <button
                className={`${deleteConditionalStyle} rounded-xl p-2 capitalize duration-300 ease-in-out`}
                onClick={() => void toggleDelete(id)}
                disabled={!indexCondition}
              >
                delete
              </button>
              <button
                onClick={() => handleEditRow(id)}
                disabled={state.permissionArray.length === 0}
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
    const unsub = onSnapshot(
      query(getCollection("permission"), orderBy("dateCreated", "desc")),
      (snapshot) => {
        const permissionArray: ReadPermissionProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as PermissionProps;
          permissionArray.push({ ...data, id });
        });
        setState((prevState) => ({
          ...prevState,
          permissionArray,
        }));
      },
    );
    return unsub;
  }, []);

  return (
    <SectionContainer extensionName="admins & faculty">
      <>
        <AddUser>
          <RoleModal />
        </AddUser>
        <div>
          <table className="mt-10 w-full">
            <thead className="capitalize">
              <RenderTableHeadings headings={adminHeadings} />
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </>
    </SectionContainer>
  );
};

const AssignAdviser = () => {
  const initState: AssignAdviserStateProps = {
    adviser: [],
    faculty: [],
    section: "a",
    yearLevel: "1st Year",
    selectedFaculty: null,
  };
  const [state, setState] = useState(initState);

  async function handleRevoke(id: string) {
    try {
      await deleteDoc(doc(getCollection("adviser"), id));
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
        const adviserColRef = getCollection("adviser");
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
    <select
      required
      defaultValue=""
      onChange={handleChangeEvent("selectedFaculty")}
    >
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
  const handleChangeEvent =
    (key: keyof typeof state) => (event: ChangeEvent<HTMLSelectElement>) => {
      setState((prevState) => ({ ...prevState, [key]: event.target.value }));
    };

  const renderYearLevel = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Year Level:</p>
      <Selection
        value={state.yearLevel}
        onChange={handleChangeEvent("yearLevel")}
        options={yearLevels}
      />
    </div>
  );
  const renderSection = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Section:</p>
      <Selection
        value={state.section ?? ""}
        onChange={handleChangeEvent("section")}
        options={sections}
      />
    </div>
  );

  // const handleChangeFromServer =
  //   ({ id }: { id: string }) =>
  //   async (event: ChangeEvent<HTMLSelectElement>) => {
  //     try {
  //       const select = event.currentTarget;
  //       const key =
  //         select.options[0]?.value.length === 1 ? "section" : "yearLevel";
  //       const data = {
  //         dateEdited: new Date().getTime(),
  //         [key]: event.target.value,
  //       };
  //       await updateDoc(doc(getCollection("adviser"), id), data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  async function handleChangeFromServer({
    id,
    event,
  }: {
    id: string;
    event: FormEvent<HTMLSelectElement>;
  }) {
    if (confirm("Are you sure you want to change this field?")) {
      try {
        const select = event.currentTarget;
        const key =
          select.options[0]?.value.length === 1 ? "section" : "yearLevel";
        const data = {
          dateEdited: new Date().getTime(),
          [key]: select.value,
        };
        await updateDoc(doc(getCollection("adviser"), id), data);
      } catch (err) {
        console.log(err);
      }
    }
  }

  const renderAdvisers = () =>
    state.adviser.map(
      ({ id, section, yearLevel, name, email, dateCreated, dateEdited }) => {
        const { createdDate, editedDate } = handleEditedCreatedDates(
          dateCreated,
          dateEdited,
        );

        return (
          <tr key={id} className="border p-2">
            <td className="border p-2">
              <p>{email}</p>
            </td>
            <td className="border p-2">
              <p>{name ?? "N/A"}</p>
            </td>
            <td className="border p-2">
              <Selection
                options={yearLevels}
                onChange={(event) => void handleChangeFromServer({ id, event })}
                value={yearLevel}
              />
            </td>
            <td className="border p-2 capitalize">
              <Selection
                options={sections}
                onChange={(event) => void handleChangeFromServer({ id, event })}
                value={section ?? "a"}
              />
            </td>
            <td>{setUpPrefix(createdDate).replace(/,/, "")}</td>
            <td>{editedDate}</td>
            <td className="flex justify-center">
              <ActionButton
                onClick={() => void handleRevoke(id)}
                text="revoke"
                color="red"
              />
            </td>
          </tr>
        );
      },
    );

  useEffect(() => {
    const adviserColRef = getCollection("adviser");
    const facultyColRef = getCollection("permission");

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
      return onSnapshot(query(facultyColRef), (snapshot) => {
        const faculty: ReadFacultyInfoProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as FacultyInfoProps;
          faculty.push({ ...data, id });
        });
        setState((prevState) => ({ ...prevState, faculty }));
      });
    }

    return () => {
      getAdviser();
      getFaculty();
    };
  }, []);

  return (
    <SectionContainer extensionName={"advisers"}>
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
            <thead className="capitalize">
              <RenderTableHeadings
                headings={["email", ...adviserMayorHeadings]}
              />
            </thead>
            <tbody>{renderAdvisers()}</tbody>
          </table>
        </section>
      </>
    </SectionContainer>
  );
};
const AssignMayor = () => {
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
  console.log(state.selectedMayor);
  async function handleClassMayor() {
    const { yearLevel, section, selectedMayor, studentsWithSection } = state;
    const localSelected = studentsWithSection.filter(
      (student) => selectedMayor === student.studentNo,
    )[0];
    const mayorColRef = getCollection("mayor");
    const formattedSection = `${yearLevel.charAt(0)}${section?.toUpperCase()}`;
    const mayorInfo: Omit<MayorInfoProps, "id"> = {
      name: localSelected?.name ?? "",
      email: localSelected?.email ?? "",
      section: section ?? "a",
      yearLevel,
      studentNo: selectedMayor ?? "",
      dateCreated: new Date().getTime(),
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
  const handleChangeEvent =
    (key: keyof typeof state) => (event: ChangeEvent<HTMLSelectElement>) => {
      setState((prevState) => ({ ...prevState, [key]: event.target.value }));
    };
  async function handleChangeFromServer({
    id,
    event,
  }: {
    id: string;
    event: FormEvent<HTMLSelectElement>;
  }) {
    if (confirm("Are you sure you want to change this field?")) {
      try {
        const select = event.currentTarget;
        const key =
          select.options[0]?.value.length === 1 ? "section" : "yearLevel";
        const data = {
          dateEdited: new Date().getTime(),
          [key]: select.value,
        };

        const editMayorInfo = await getDoc(doc(getCollection("student"), id));
        const result = await getDocs(
          query(
            getCollection("student"),
            where("email", "==", editMayorInfo.data()?.email),
          ),
        );
        const mayorProps = result.docs[0]?.data() as MayorInfoProps;

        key === "section" &&
          result.docs[0] &&
          (await updateDoc(
            doc(getCollection("student"), mayorProps.studentNo),
            {
              dateEdited: new Date().getTime(),
              section: select.value,
            },
          ));
        await updateDoc(doc(getCollection("mayor"), id), data);
      } catch (err) {
        console.log(err);
      }
    }
  }

  const renderYearLevel = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Year Level:</p>
      <Selection
        options={yearLevels}
        value={state.yearLevel}
        onChange={handleChangeEvent("yearLevel")}
      />
    </div>
  );
  const renderSection = () => (
    <div className="flex items-center justify-center gap-2">
      <p className="w-24">Section:</p>
      <Selection
        options={sections}
        value={state.section ?? "a"}
        onChange={handleChangeEvent("section")}
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
    state.mayors.map(
      ({
        id,
        studentNo,
        section,
        yearLevel,
        name,
        dateCreated,
        dateEdited,
      }) => {
        const { createdDate, editedDate } = handleEditedCreatedDates(
          dateCreated,
          dateEdited,
        );
        return (
          <tr key={studentNo} className="border p-2">
            <td className="border p-2">
              <p>{name}</p>
            </td>
            <td className="border p-2">
              <Selection
                options={yearLevels}
                onChange={(event) => void handleChangeFromServer({ id, event })}
                value={yearLevel}
              />
            </td>
            <td className="border p-2 capitalize">
              <Selection
                options={sections}
                onChange={(event) => void handleChangeFromServer({ id, event })}
                value={section ?? "a"}
              />
            </td>
            <td>{setUpPrefix(createdDate).replace(/,/, "")}</td>
            <td>{editedDate}</td>
            <td className="flex justify-center">
              <ActionButton
                onClick={() => void handleRevoke(id, studentNo)}
                text="revoke"
                color="red"
              />
            </td>
          </tr>
        );
      },
    );

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
    const mayorColRef = getCollection("mayor");

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
            <thead className="capitalize">
              <RenderTableHeadings headings={adviserMayorHeadings} />
            </thead>
            <tbody>{renderMayors()}</tbody>
          </table>
        </section>
      </>
    </SectionContainer>
  );
};

export default Permission;
