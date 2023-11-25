import Image from "next/image";
import type { ReactNode } from "react";

interface ProfilePictureProps {
  src: string;
}
interface ProfilePictureContainerProps extends ProfilePictureProps {
  renderCondition?: boolean;
  children: ReactNode;
}
const ProfilePicture = ({ src }: ProfilePictureProps) => {
  const DIMENSION = 46;

  if (src.trim() === "") {
    return (
      <div className="h-16 w-16 self-center overflow-hidden rounded-full bg-primary">
        <p className="text-primary">avatar</p>
      </div>
    );
  }

  return (
    <div className="h-16 w-16 self-center">
      <Image
        src={src}
        alt="avatar"
        className="h-full w-full rounded-full"
        width={DIMENSION}
        height={DIMENSION}
      />
    </div>
  );
};
const ProfilePictureContainer = ({
  renderCondition,
  children,
  ...rest
}: ProfilePictureContainerProps) => {
  const additionalStyle = renderCondition ? "flex-row-reverse" : "flex-row";
  return (
    <div className={`${additionalStyle} flex items-start gap-2 rounded-lg p-2`}>
      <ProfilePicture {...rest} />
      {children}
    </div>
  );
};

export default ProfilePictureContainer;
