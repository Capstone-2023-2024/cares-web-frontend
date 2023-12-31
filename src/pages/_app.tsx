import type { AppProps } from "next/app";
import "~/styles/globals.css";
import ContextProviders from "~/contexts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContextProviders>
      <Component {...pageProps} />
    </ContextProviders>
  );
}
