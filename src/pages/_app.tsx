import "~/styles/globals.css";
import type { AppProps } from "next/app";
import ContextProviders from "~/contexts";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContextProviders>
      <Component {...pageProps} />
      <Analytics />
    </ContextProviders>
  );
}
