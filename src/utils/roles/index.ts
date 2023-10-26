import type { RoleProps } from "./types";

export const roleOptions: RoleProps[] = [
  { title: "admin_1", access_level: { name: "super_admin", partial: false } },
  { title: "admin_2", access_level: { name: "admin", partial: false } },
  { title: "admin_3", access_level: { name: "sub_admin", partial: false } },
  { title: "faculty", access_level: { name: "faculty", partial: false } },
];
