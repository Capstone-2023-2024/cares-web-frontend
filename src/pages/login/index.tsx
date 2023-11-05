import { useRouter } from "next/router";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Loading from "~/components/Loading";
import { useAuth } from "~/contexts/AuthContext";
import type { InitialAuthProps } from "~/types/login";

const initialProps: InitialAuthProps = {
  email: "",
  password: "",
};

const Login = () => {
  const [state, setState] = useState(initialProps);
  const [error, setError] = useState(false);
  const { emailAndPassSignin, currentUser, loading, signInWithGoogle } =
    useAuth();
  const router = useRouter();
  const inputBaseStyle =
    "rounded-lg border p-4 shadow-sm outline-none duration-300 ease-in-out";

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
      const response = await emailAndPassSignin({ ...state });

      if (response === "SUCCESS") {
        setState(initialProps);
        return router.replace("/dashboard");
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
      <div className="fixed inset-x-0 bg-primary p-2 text-white">
        <p className="uppercase">cares</p>
      </div>
      <form
        onSubmit={(e) => void handleSubmitEmailAndPassword(e)}
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
        <p>or</p>
        <button type="button" onClick={() => void handleGoogleSignIn()}>
          Sign in with Google
        </button>
      </form>
      <p
        className={`${
          error ? "opacity-100" : "opacity-0"
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
