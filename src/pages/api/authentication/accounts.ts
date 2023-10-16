// import type { NextApiRequest, NextApiResponse } from "next";
import type { ResponseData } from "./types";

export default async function handler() {
  // req: NextApiRequest,
  // res: NextApiResponse<ResponseData>
  const ACCOUNTS: ResponseData = {
    bm: "bm@cares.com",
    admin: "admin@cares.com",
  };
  return ACCOUNTS;
  // res.status(200).json(ACCOUNTS);
}
