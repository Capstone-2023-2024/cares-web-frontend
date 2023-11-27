import { imageDimension } from "@cares/utils/media";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Header from "~/components/Header/Header";
import Loading from "~/components/Loading";
import TextInput from "~/components/TextInput";
import { useAuth } from "~/contexts/AuthProvider";
import { ICON } from "~/utils/media";

interface InitialAuthProps {
  email: string;
  password: string;
  error: boolean;
}

const initialProps: InitialAuthProps = {
  email: "",
  password: "",
  error: false,
};

const Login = () => {
  const router = useRouter();
  const [state, setState] = useState(initialProps);
  const { currentUser, loading, emailAndPassSignin, signInWithGoogle } =
    useAuth();

  function handleEmail(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const email = event.target.value;
    setState((prevState) => ({ ...prevState, email }));
  }
  function handlePassword(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const password = event.target.value;
    setState((prevState) => ({ ...prevState, password }));
  }
  async function handleSubmitEmailAndPassword(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const form = e.currentTarget;
      const submit = form.querySelector("#submit");
      submit?.setAttribute("disabled", "true");
      const response = await emailAndPassSignin({ ...state });

      if (response === "SUCCESS") {
        submit?.removeAttribute("disabled");
        setState(initialProps);
        return router.replace("/dashboard");
      }
      submit?.removeAttribute("disabled");
      setState((prevState) => ({ ...prevState, error: true }));
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, error: false }));
      }, 800);
    } catch (err) {
      console.log(err);
    }
  }
  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function setup() {
      try {
        if (currentUser !== null) {
          await router.replace("/dashboard");
        }
      } catch (err) {
        console.log(err);
      }
    }
    return void setup();
  }, [currentUser, router]);

  return !loading ? (
    <div className="animate-gradient relative min-h-screen bg-gradient-to-t from-primary via-paper to-paper bg-[length:400%_400%]">
      <div className="animate-gradient absolute z-0 h-full w-screen bg-[url('/bg-login.png')] bg-cover bg-center" />
      <Header />
      <div className="relative flex h-full items-center justify-center">
        <div className="absolute inset-y-0 z-10 mt-20 h-max w-4/5 rounded-lg bg-white p-8 shadow-xl transition duration-300 ease-in-out hover:shadow-2xl sm:w-96">
          <form
            onSubmit={(e) => void handleSubmitEmailAndPassword(e)}
            className="flex flex-col items-center gap-4"
          >
            <h2 className="mb-4 text-center text-3xl font-bold">Login</h2>
            <p className="mt-0 text-center"></p>
            <TextInput
              required
              background="bg-white"
              condition={state.error}
              name="email"
              id="email"
              type="email"
              value={state.email}
              onChange={handleEmail}
            />
            <TextInput
              required
              background="bg-white"
              condition={state.error}
              name="password"
              id="password"
              type="password"
              value={state.password}
              onChange={handlePassword}
            />
            <p className="mt-4 text-center"></p>
            <button
              id="submit"
              type="submit"
              className={`rounded-lg bg-primary px-20 py-3 text-white shadow-md duration-300 ease-in-out ease-in-out hover:scale-105 hover:bg-secondary active:bg-paper active:text-primary`}
            >
              Login
            </button>
            <p className="mt-0 text-center">or</p>
            <button
              type="button"
              className="flex transform items-center justify-between gap-2 rounded-lg bg-white px-6 py-2 shadow-md duration-300 duration-300 ease-in-out ease-in-out hover:scale-105 hover:bg-blue-500 hover:text-paper hover:text-white active:bg-secondary active:text-paper"
              onClick={() => void handleGoogleSignIn()}
            >
              <div className="rounded-full bg-white p-1">
                <Image
                  alt="google"
                  src="/google.svg"
                  className="h-8 w-8"
                  {...imageDimension(ICON)}
                />
              </div>
              <span>Sign in with Google</span>
            </button>
          </form>
          <p
            className={`${
              state.error ? "opacity-100" : "opacity-0"
            } mt-4 select-none text-center text-red-500 duration-300 ease-in-out`}
          >
            Authentication Error
          </p>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Login;
