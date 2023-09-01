import child_process from "child_process";
import type { NextApiRequest, NextApiResponse } from "next";
import { readdir } from "node:fs/promises";
import os from "os";
import path from "path";

type ResponseData = {
  message: string[] | Buffer | string;
};

function openExplorerin(path: string, callback: (error: Error) => void) {
  let cmd = "";
  switch (
    os.platform().toLowerCase().replace(/[0-9]/g, "").replace(`darwin`, `macos`)
  ) {
    case `win`:
      path = path ?? "=";
      cmd = `explorer`;
      break;
    case `linux`:
      path = path ?? "/";
      cmd = `xdg-open`;
      break;
    case `macos`:
      path = path ?? "/";
      cmd = `open`;
      break;
  }
  const p = child_process.spawn(cmd, [path]);
  p.on("error", (err: Error) => {
    p.kill();
    return callback(err);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const dir = "C:\\Users\\cmain\\Desktop";
  const formattedPath = path.format({
    dir,
    base: "RealSyntexia",
  });
  const pathDir = path.dirname(formattedPath);
  console.log(pathDir);
  const fileHolder: string[] = [];
  const files = await readdir(formattedPath);
  for (const file of files) fileHolder.push(file);
  openExplorerin(dir, (err: Error) => {
    console.log(err);
  });
  // exec(`start "" ${dir}`);
  res.status(200).json({ message: fileHolder });
}
