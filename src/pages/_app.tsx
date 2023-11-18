import "~/styles/globals.css";
import type { AppProps } from "next/app";
import ContextProviders from "~/contexts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContextProviders>
      <Component {...pageProps} />
    </ContextProviders>
  );
}
