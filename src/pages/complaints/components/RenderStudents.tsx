import { useComplaints } from "../ComplaintsProvider";
import { useContentManipulation } from "../ContentManipulationProvider";
import { useModal } from "../ModalProvider";
import { useUniversal } from "../UniversalProvider";
import ProfilePictureContainer from "./ProfilePictureContainer";

const RenderStudents = () => {
  const { currentStudentComplaints } = useComplaints();
  const { showStudents } = useModal();
  const { studentsInfo, currentStudentInfo } = useUniversal();
  const { selectedStudent, setSelectedStudent, setSelectedChatHead } =
    useContentManipulation();
  const studentNumbers = [
    ...new Set(currentStudentComplaints.map((props) => props.studentNo)),
  ];
  const filteredStudentList = studentsInfo?.filter(
    (props) =>
      props.email !== currentStudentInfo?.email &&
      studentNumbers.includes(props.studentNo),
  );

  if (filteredStudentList === undefined) {
    return <></>;
  }

  return (
    <div
      className={`${
        showStudents ? "flex" : "hidden"
      } mx-auto w-full gap-2 overflow-x-auto bg-secondary p-2`}
    >
      {filteredStudentList.length < 0 ? (
        <div>
          <h2>No Complaints</h2>
        </div>
      ) : (
        filteredStudentList.map(({ studentNo, name, src }) => {
          return (
            <button
              key={studentNo}
              className={`${
                selectedStudent === studentNo
                  ? "scale-95 border-2 border-primary bg-secondary hover:bg-primary/20"
                  : "scale-90 bg-paper/90 hover:scale-95 hover:bg-paper"
              } h-24 rounded-lg duration-300 ease-in-out`}
              onClick={() => {
                setSelectedStudent(studentNo);
                setSelectedChatHead("students");
              }}
            >
              <ProfilePictureContainer src={src ?? ""}>
                <div className="text-start">
                  <p
                    className={`${
                      selectedStudent === studentNo
                        ? "text-paper"
                        : "text-black"
                    } font-bold`}
                  >
                    {name}
                  </p>
                  <p
                    className={`${
                      selectedStudent === studentNo
                        ? "text-paper"
                        : "text-primary"
                    } font-bold`}
                  >
                    {studentNo}
                  </p>
                </div>
              </ProfilePictureContainer>
            </button>
          );
        })
      )}
    </div>
  );
};

export default RenderStudents;
