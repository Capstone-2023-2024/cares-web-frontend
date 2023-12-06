import { type HTMLAttributes, forwardRef, type ForwardedRef } from "react";

interface UploadButtonProps extends HTMLAttributes<HTMLInputElement> {
  files?: File[];
  disabled?: boolean;
}

const UploadButton = forwardRef(
  (props: UploadButtonProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className="absolute right-0 top-36 z-10 flex w-24 overflow-hidden rounded-xl bg-blue-400/40 px-4 py-2 text-white/40 duration-300 ease-in-out hover:bg-blue-400 hover:text-white">
        <label className="absolute inset-x-0 mx-auto w-2/3 self-center text-center text-xs">
          {props.files !== undefined ? "Rechoose images" : "Choose Images"}
        </label>
        <input
          multiple
          type="file"
          ref={ref}
          {...props}
          accept=".jpg, .jpeg, .png"
          className={`${
            props.disabled ? "cursor-pointer" : ""
          } h-full w-full scale-150 opacity-0`}
        />
      </div>
    );
  },
);
UploadButton.displayName = "Upload";
export default UploadButton;
