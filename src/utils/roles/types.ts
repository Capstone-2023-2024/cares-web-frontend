export interface RoleProps {
  title: "admin_1" | "admin_2" | "admin_3" | "faculty";
  access_level:
    | { name: "super_admin"; partial: boolean }
    | { name: "admin"; partial: boolean }
    | { name: "sub_admin"; partial: boolean }
    | { name: "faculty"; partial: boolean };
}

export interface BaseRoleProps {
  role: RoleProps;
  disabled?: boolean;
}
