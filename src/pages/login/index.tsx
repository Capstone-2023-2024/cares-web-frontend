import { collection, doc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, type FormEvent } from "react";
import Header from "~/components/Header/Header";
import Loading from "~/components/Loading";
import { useAuth } from "~/contexts/AuthContext";
import type { StudentWithClassSection } from "~/types/student";
import { db } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";

const Login = () => {
  const alphabet = "abcdefghijkl";
  const initState: Omit<StudentWithClassSection, "section"> = {
    studentNo: `${new Date().getFullYear()}200200`,
    college: "College of Information and Communications",
    schoolYear: "1st Semester AY 2023-2024",
    name: "DOE, John RA.",
    course: "Bachelor of Science in Information Technology",
    gender: "M",
    major: "N/A",
    curriculum: "BSIT (2018-2019)",
    age: "23",
    yearLevel: "4th Year",
    scholarship: "Official Receipt: Unifast Scholar",
    email: "johndoe.ra@gmail.com",
  };
  const { currentUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [state, setState] = useState(initState);
  const [section, setSection] =
    useState<Pick<StudentWithClassSection, "section">>();

  function handleState(key: keyof typeof state, value: string) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log({ ...state, section });
    try {
      await setDoc(doc(collection(db, "student"), state.studentNo), {
        section,
        ...state,
      });
      alert("Student Info sent to firestore");
    } catch (err) {
      alert("Error in writing student info");
    }
    setState(initState);
    setSection("a" as typeof section);
  }

  useEffect(() => {
    async function setup() {
      try {
        if (currentUser !== null) {
          await router.replace("/complaints");
        }
      } catch (err) {
        console.log(err);
      }
    }
    return void setup();
  }, [currentUser, router]);

  return !loading ? (
    <div className="h-screen">
      <Header />
      <form
        onSubmit={(e) => void handleFormSubmit(e)}
        className="flex flex-col items-center justify-center gap-2 p-2 text-center"
      >
        <div className="flex w-max items-center justify-between">
          <h1 className="p-4 text-lg font-semibold capitalize">
            development dummy student data maker
          </h1>
          <button
            type="button"
            className="m-8 flex justify-center gap-2 self-center rounded-lg bg-paper px-6 py-2 shadow-md duration-300 ease-in-out hover:scale-105 active:bg-secondary active:text-paper"
            onClick={() => void handleGoogleSignIn()}
          >
            <Image
              alt="google"
              src="/google.svg"
              className="h-8 w-8"
              {...imageDimension(icon)}
            />
            Sign in
          </button>
        </div>
        {Object.keys(state).map((props) => {
          const objectName = props as keyof typeof state;
          return (
            <div
              key={objectName}
              className="flex w-2/3 items-center justify-between"
            >
              <label
                className="w-48 p-2 text-start font-bold capitalize"
                htmlFor={objectName}
              >
                {objectName}
              </label>
              <input
                required
                id={objectName}
                type="text"
                className="flex-1 rounded-sm border-b p-2 shadow-md"
                onChange={(e) => handleState(objectName, e.target.value)}
                value={state[objectName]}
              />
            </div>
          );
        })}
        <div className="flex w-2/3 items-center justify-between">
          <label
            className="w-48 p-2 text-start font-bold capitalize"
            htmlFor="section"
          >
            section
          </label>
          <select
            required
            id="section"
            className="flex-1 rounded-sm bg-white/20 px-4 py-2 text-center capitalize shadow-md"
            value={section as string}
            onChange={(e) => setSection(e.target.value as typeof section)}
          >
            {new Array(7).fill("").map((v, index) => {
              return (
                <option key={index} value={alphabet[index]}>
                  {alphabet[index]}
                </option>
              );
            })}
          </select>
        </div>
        <button
          className="hover:green-400 rounded-sm bg-green-500/50 p-2 px-4 py-2 font-bold uppercase text-white shadow-sm hover:scale-105"
          type="submit"
        >
          submit
        </button>
      </form>
    </div>
  ) : (
    <Loading />
  );
};

export default Login;
