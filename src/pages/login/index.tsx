import Image from "next/image";
import { useRouter } from "next/router";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Header from "~/components/Header/Header";
import Loading from "~/components/Loading";
import { useAuth } from "~/contexts/AuthContext";
import type { InitialAuthProps } from "~/types/login";
import { icon, imageDimension } from "~/utils/image";

const initialProps: InitialAuthProps = {
  email: "",
  password: "",
  error: false,
};

const Login = () => {
  const [state, setState] = useState(initialProps);
  const { emailAndPassSignin, currentUser, loading, signInWithGoogle } =
    useAuth();
  const router = useRouter();
  const inputBaseStyle =
    "rounded-lg border py-2 px-4 shadow-sm outline-none duration-300 ease-in-out";

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
    <div className="h-screen">
      <Header />
      <form
        onSubmit={(e) => void handleSubmitEmailAndPassword(e)}
        className="flex h-full flex-col items-center justify-center gap-4"
      >
        <h2 className="text-center text-3xl font-bold">Login</h2>
        <input
          className={`${
            state.error
              ? "animate-shake border-red-500 animate-infinite animate-ease-in"
              : "border-primary"
          } ${inputBaseStyle}`}
          // className={`${(state.email) ? 'border-green-500' : state.email === '' ? 'border-slate-300' : 'border-red-500'} ${inputBaseStyle}`}
          required
          type="email"
          onChange={handleEmail}
          placeholder="Email"
        />
        <input
          className={`${
            state.error
              ? "animate-shake border-red-500 animate-infinite animate-ease-in"
              : "border-primary"
          } ${inputBaseStyle}`}
          required
          type="password"
          onChange={handlePassword}
          placeholder="Password"
        />
        <button
          id="submit"
          type="submit"
          className={`rounded-lg bg-primary px-12 py-3 text-white shadow-md duration-300 ease-in-out hover:scale-105 active:bg-paper active:text-primary`}
        >
          Login
        </button>
        <p>or</p>
        <button
          type="button"
          className="flex items-center justify-between gap-2 rounded-lg bg-paper px-6 py-2 shadow-md duration-300 ease-in-out hover:scale-105 active:bg-secondary active:text-paper"
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
      </form>
      <p
        className={`${
          state.error ? "opacity-100" : "opacity-0"
        } select-none text-red-500 duration-300 ease-in-out`}
      >
        Authentication Error
      </p>
    </div>
  ) : (
    <Loading />
  );
};

export default Login;
