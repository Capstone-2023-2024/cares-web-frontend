import { useRef } from "react";
import type { FocusEvent, MouseEvent } from "react";
import type { TextInputProps } from "./type";

/** Add the styles array unto the base style before modifying it in `inputFocusEvent` */
function addClassListToBaseStyle(baseStyle: string, classList: string[]) {
  let style = baseStyle;
  classList.forEach((value) => (style += ` ${value}`));
  return style;
}

/** Array represents the style array, target is the element, and method will be `add`, `remove`, and `toggle` respectively */
function manageClassList(
  array: string[],
  target:
    | HTMLLabelElement
    | HTMLDivElement
    | HTMLButtonElement
    | HTMLInputElement
    | null,
  method: "remove" | "toggle" | "add",
) {
  array.forEach((value) => {
    if (target !== null) {
      switch (method) {
        case "remove":
          return target?.classList.remove(value);
        case "toggle":
          return target?.classList.toggle(value);
        case "add":
          return target?.classList.add(value);
        default:
          return;
      }
    }
  });
}

function combineClassList(classLists: string[]) {
  return [...new Set(classLists)];
}

/** `background` can be any tailwindcss background */
const TextInput = ({
  name,
  id,
  condition,
  background,
  ...rest
}: TextInputProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const EMPTY = "";

  /**
   *
   * CLASS LIST styles
   *
   * */

  /** SHARED styles accross all elements */
  const sharedBaseStyle = ["ease-in-out", "duration-300"];
  /** NOT SHARED styles */
  const divClassList = ["border-paper"];
  const divClassListOnFocus = ["border-blue-500"];
  const labelClassList = ["top-4", "left-4", "bg-transparent"];
  const labelClassListWithValue = ["-top-2", "left-3", "text-sm", "bg-inherit"];
  const eyeconClassList = ["opacity-0", "cursor-default"];
  const eyeconClassListOnFocus = ["opacity-100", "select-none"];

  /** DIV Base Styling */
  const inputContainerBaseStyle = `w-full rounded-lg shadow-md  border p-4 relative ${
    background ?? "bg-transparent"
  }`;
  const inputContainerBaseErrorStyle = "animate-shake border-red-500";
  const inputContainerBaseTrueStyle = "";
  const inputContainerBaseTotalStyle = `${
    condition ? inputContainerBaseErrorStyle : inputContainerBaseTrueStyle
  } ${addClassListToBaseStyle(inputContainerBaseStyle, [
    ...sharedBaseStyle,
    ...divClassList,
  ])}`;

  /** LABEL Base Styling */
  const inputTextBaseStyle = "text-black absolute capitalize";
  const inputTextBaseErrorStyle = "";
  const inputTextBaseTrueStyle = "";
  const inputTextBaseTotalStyle = `${
    condition ? inputTextBaseErrorStyle : inputTextBaseTrueStyle
  } ${addClassListToBaseStyle(inputTextBaseStyle, [
    ...sharedBaseStyle,
    ...labelClassList,
  ])}`;

  /** INPUT Base Styling */
  const inputBaseErrorStyle = "";
  const inputBaseTrueStyle = "";
  const inputBaseStyle = "bg-inherit w-full h-full outline-none";
  const inputBaseTotalStyle = `${
    condition ? inputBaseErrorStyle : inputBaseTrueStyle
  } ${inputBaseStyle}`;

  /** BUTTON base styles */
  const eyeconBaseStyle = "absolute right-2 z-20";
  const eyeconBaseErrorStyle = "";
  const eyeconBaseTrueStyle = "";
  const eyeconBaseTotalStyle = `${
    condition ? eyeconBaseErrorStyle : eyeconBaseTrueStyle
  } ${addClassListToBaseStyle(eyeconBaseStyle, [
    ...sharedBaseStyle,
    ...eyeconClassList,
  ])}`;

  /**
   *
   * FUNCTIONS
   *
   * */

  function inputFocusEvent(focus: FocusEvent<HTMLInputElement>) {
    focus.preventDefault();
    if (divRef.current !== null) {
      const parentDiv = divRef.current;
      const label = parentDiv.querySelector("label");
      const eyeconButton = parentDiv.querySelector("button");

      /** PUT here all the ELEMENT(s) to be toggled without conditions */
      manageClassList(
        [...divClassList, ...divClassListOnFocus],
        parentDiv,
        "toggle",
      );
      if (rest.type === "password") {
        manageClassList(
          [...eyeconClassList, ...eyeconClassListOnFocus],
          eyeconButton,
          "toggle",
        );
      }

      /** PUT here all the ELEMENT(s) to be toggled if value is empty */
      if (rest.value.trim() === EMPTY) {
        return manageClassList(
          combineClassList([...labelClassList, ...labelClassListWithValue]),
          label,
          "toggle",
        );
      }
      manageClassList(labelClassList, label, "remove");
      manageClassList(labelClassListWithValue, label, "add");
    }
  }

  function eyeconMouseDown(mouseDown: MouseEvent<HTMLButtonElement>) {
    mouseDown.preventDefault();
    const button = mouseDown.currentTarget;
    if (divRef.current !== null) {
      const eyecon = button.firstElementChild;
      const parentDiv = divRef.current;
      const inputElement = parentDiv.querySelector("input");

      if (button.classList.contains("opacity-100")) {
        if (inputElement !== null) {
          const type = inputElement.getAttribute("type");
          inputElement.setAttribute(
            "type",
            type === "text" ? "password" : "text",
          );
        }
        return eyecon?.classList.toggle("opacity-25");
      }
      inputElement !== null && inputElement.focus();
    }
  }

  return (
    <div ref={divRef} className={inputContainerBaseTotalStyle}>
      {!rest.placeholder && (
        <label htmlFor={id} className={inputTextBaseTotalStyle}>
          {name}
        </label>
      )}
      <input
        id={id}
        {...rest}
        onFocus={inputFocusEvent}
        onBlur={inputFocusEvent}
        className={inputBaseTotalStyle}
      />
      {rest.type === "password" && (
        <button
          type="button"
          onMouseDown={eyeconMouseDown}
          className={eyeconBaseTotalStyle}
        >
          <p className={addClassListToBaseStyle("", [...sharedBaseStyle])}>
            eyecon
          </p>
        </button>
      )}
    </div>
  );
};

export default TextInput;
