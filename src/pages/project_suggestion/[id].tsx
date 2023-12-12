import { useRouter } from "next/router";
import React from "react";

const Poll = () => {
  const router = useRouter();
  return <div>{router.route}</div>;
};

export default Poll;
