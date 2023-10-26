import type { PermissionCategoryButtonProps } from "./types";

const PermissionCategoryButton = ({
  children,
  ...rest
}: PermissionCategoryButtonProps) => {
  return (
    <button
      className="flex w-full flex-row justify-between bg-primary p-2 text-paper shadow-sm"
      {...rest}
    >
      {children}
    </button>
  );
};

export default PermissionCategoryButton;
