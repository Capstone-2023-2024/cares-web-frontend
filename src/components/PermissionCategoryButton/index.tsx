import type { PermissionCategoryButtonProps } from "./types";

const PermissionCategoryButton = ({
  children,
  ...rest
}: PermissionCategoryButtonProps) => {
  return (
    <div
      className="flex w-full flex-row justify-between rounded-lg bg-primary p-4 text-paper shadow-md duration-300 ease-in-out hover:bg-secondary"
      {...rest}
    >
      {children}
    </div>
  );
};

export default PermissionCategoryButton;
