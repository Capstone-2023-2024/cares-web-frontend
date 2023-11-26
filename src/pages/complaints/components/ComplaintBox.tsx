import { setUpPrefix } from "@cares/utils/date";
import { useComplaints } from "../ComplaintsProvider";
import { useContentManipulation } from "../ContentManipulationProvider";
import { useUniversal } from "../UniversalProvider";
import ProfilePictureContainer from "./ProfilePictureContainer";
import RenderActionButtons from "./RenderActionButtons";

const StyledDateTime = ({ timestamp }: { timestamp: Date }) => {
  return <p className="text-xs font-thin">{setUpPrefix(timestamp)}</p>;
};

const ComplaintBox = () => {
  const { currentStudentComplaints, otherComplaints, classSectionComplaints } =
    useComplaints();
  const { role, studentsInfo, adviserInfo, currentStudentInfo } =
    useUniversal();
  const { selectedChatId, selectedChatHead, selectedStudent } =
    useContentManipulation();

  const currentStudentInfoRoot = currentStudentComplaints.filter(
    (props) => selectedStudent === props.studentNo,
  );
  const filterOtherComplaints = otherComplaints.filter(
    (props) => selectedChatId === props.id,
  );
  const filterCurrentStudent = currentStudentInfoRoot.filter(
    (props) => selectedChatId === props.id,
  );

  const renderThisArray =
    selectedChatHead === "class_section"
      ? classSectionComplaints
      : filterOtherComplaints.length > 0
        ? filterOtherComplaints[0]?.messages
        : filterCurrentStudent[0]?.messages;

  const targetArray = filterOtherComplaints[0] ?? filterCurrentStudent[0];

  return (
    <>
      <RenderActionButtons targetArray={targetArray} />
      <div className="flex h-[60vh] flex-col gap-2 overflow-y-auto bg-primary/10 p-2">
        {renderThisArray?.map(({ message, timestamp, sender }, index) => {
          const newTimestamp = new Date();
          newTimestamp.setTime(timestamp);
          // console.log({ studentsInfo });
          const targetStudent = studentsInfo?.filter(
            (props) => sender === props.studentNo,
          )[0];
          const renderCondition =
            role === "adviser"
              ? sender === adviserInfo?.email
              : sender === currentStudentInfo?.studentNo;

          return (
            <ProfilePictureContainer
              key={index}
              renderCondition={renderCondition}
              src={
                sender === adviserInfo?.email
                  ? adviserInfo?.src ?? ""
                  : targetStudent?.src ?? ""
              }
            >
              <div
                className={`${
                  renderCondition ? "text-end" : "text-start"
                } relative flex-1 p-1`}
              >
                <div>
                  <p className="font-bold">
                    {sender === adviserInfo?.email
                      ? adviserInfo?.name ??
                        adviserInfo?.email ??
                        "Deleted Faculty"
                      : targetStudent?.name ?? "Deleted User"}
                  </p>
                  <p className="font-bold text-primary">
                    {sender === adviserInfo?.email
                      ? `${adviserInfo?.yearLevel.substring(
                          0,
                          1,
                        )}${adviserInfo?.section?.toUpperCase()} Adviser`
                      : sender}
                  </p>
                  <p>{message}</p>
                </div>
              </div>
              <StyledDateTime timestamp={newTimestamp} />
            </ProfilePictureContainer>
          );
        })}
      </div>
    </>
  );
};

export default ComplaintBox;
