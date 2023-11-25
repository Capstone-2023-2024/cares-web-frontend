import type { ReactNode } from "react";
import { useComplaints } from "./ComplaintsProvider";
import {
  useContentManipulation,
  type ContentManipulationProviderStateProps,
} from "./ContentManipulationProvider";
import { useUniversal } from "./UniversalProvider";
import { ChatHeadButton, ComplaintBoxRenderer } from "./components";
import type { ComplaintBoxRendererProps } from "./components/ComplaintBoxRenderer";

interface RenderChatHeadsProps extends ComplaintBoxRendererProps {
  children?: ReactNode;
  chatHeadOnClick: (
    value: ContentManipulationProviderStateProps["selectedChatHead"],
  ) => void;
}
const RenderChatHeads = ({
  children,
  chatHeadOnClick,
  ...rest
}: RenderChatHeadsProps) => {
  const { role } = useUniversal();
  const { otherComplaints } = useComplaints();
  const { selectedChatId, selectedChatHead } = useContentManipulation();
  const recipients = otherComplaints.map((props) => props.recipient);

  if (role === "student") {
    recipients.push("mayor");
  } else if (role === "mayor") {
    const mayorIndex = recipients.indexOf(role);
    if (mayorIndex > -1) {
      recipients.splice(mayorIndex);
    }
    recipients.push("adviser");
  }

  return (
    <div>
      <div className="flex w-full flex-row gap-2 overflow-x-auto bg-primary/30 p-4">
        {[...new Set(recipients)].map((value) => {
          return (
            <ChatHeadButton
              key={value}
              name={value.replace(/_/g, " ")}
              condition={
                (typeof selectedChatId === "string" &&
                  selectedChatId === "object") ||
                selectedChatHead === value
              }
              onClick={() =>
                chatHeadOnClick(
                  value as ContentManipulationProviderStateProps["selectedChatHead"],
                )
              }
            />
          );
        })}
        {children}
      </div>
      <ComplaintBoxRenderer {...rest} />
    </div>
  );
};

export default RenderChatHeads;
