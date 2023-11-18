import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Header from "~/components/Header/Header";
import Loading from "~/components/Loading";
import { useAuth } from "~/contexts/AuthContext";
import { icon, imageDimension } from "~/utils/image";

const Login = () => {
  const { currentUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

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
    </div>
  ) : (
    <Loading />
  );
};

export default Login;
