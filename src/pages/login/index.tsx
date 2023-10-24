import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import type { InitialAuthProps, InitialAuthPropsType } from "./types";
import { useRouter } from "next/router";
import Loading from "~/components/Loading";
import { type UserCredential } from "firebase/auth";
import { validateEmail } from "~/utils/firebase";

const initialProps: InitialAuthProps = {
  email: "",
  password: "",
};

const Login = () => {
  const [state, setState] = useState(initialProps);
  const [error, setError] = useState(false);
  const { emailAndPassSignin, currentUser, loading } = useAuth();
  const router = useRouter();
  const inputBaseStyle =
    "rounded-lg border p-4 shadow-sm outline-none duration-300 ease-in-out";

  function handleState(
    key: keyof InitialAuthProps,
    value: InitialAuthPropsType
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function handleEmail(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    handleState("email", e.target.value);
  }
  function handlePassword(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    handleState("password", e.target.value);
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const response = await emailAndPassSignin({ ...state });

      if (response === "SUCCESS") {
        setState(initialProps);
        return router.push("/about");
      }
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000);
    } catch (err) {
      const error = err as Error;
      console.log({ error });
    }
  }

  useEffect(() => {
    console.log(currentUser);
    if (currentUser !== null) {
      router.push("/dashboard");
    }
  }, [currentUser]);

  return !loading ? (
    <div className="h-screen">
      <div className="fixed inset-x-0 bg-primary p-2 text-white">
        <p className="uppercase">cares</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex h-full flex-col items-center justify-center gap-4"
      >
        <h2 className="text-center text-3xl font-semibold">Login</h2>
        <input
          className={`border-slate-300 ${inputBaseStyle}`}
          // className={`${(state.email) ? 'border-green-500' : state.email === '' ? 'border-slate-300' : 'border-red-500'} ${inputBaseStyle}`}
          required
          type="email"
          onChange={handleEmail}
          placeholder="email"
        />
        <input
          className={`border-slate-300 ${inputBaseStyle}`}
          required
          type="password"
          onChange={handlePassword}
          placeholder="password"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary p-4 px-6 text-white shadow-sm"
        >
          Login
        </button>
        <p
          className={`${
            error ? "opacity-100" : "opacity-0"
          } select-none text-red-500 duration-300 ease-in-out`}
        >
          Authentication Error
        </p>
      </form>
    </div>
  ) : (
    <Loading />
  );
};

export default Login;
