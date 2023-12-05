import type { AnnouncementProps } from "@cares/common/types/announcement";
import { announcementType } from "@cares/common/utils/announcement";
import { imageDimension } from "@cares/common/utils/media";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, type ChangeEvent, type FormEvent } from "react";
import Calendar from "~/components/Calendar";
import Header from "~/components/Header/Header";
import Loading from "~/components/Loading";
import Selection from "~/components/Selection";
import TextInput from "~/components/TextInput";
import { useAnnouncement } from "~/contexts/AnnouncementProvider";
import { useDate } from "~/contexts/DateProvider";
import { getCollection } from "~/utils/firebase";

const AnnouncementWithId = () => {
  const router = useRouter();
  const { data } = useAnnouncement();
  const idHolder = router.query.id;
  const { selectedDateArray, changeSelectedDateArray } = useDate();
  const docRef = doc(
    getCollection("announcement"),
    typeof idHolder === "string" ? idHolder : "",
  );

  const result = data.filter((props) => idHolder === props.id);
  async function updateFromServer(
    event:
      | FormEvent<HTMLSelectElement>
      | FormEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>,
    key: keyof AnnouncementProps,
  ) {
    const data = {
      [key]: event.currentTarget.value,
      dateEdited: new Date().getTime(),
    };

    try {
      event.preventDefault();
      await updateDoc(docRef, data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (selectedDateArray.length > 0) {
      const date = new Date();
      // const year = date.getFullYear();
      // const month = date.getMonth();
      const length = selectedDateArray.length;
      const INDEX = length - 1;
      date.setDate(selectedDateArray[INDEX] ?? 1);
      void updateDoc(docRef, {
        markedDates: {},
        // markedDatesHandler(selectedDateArray, year, month),
        dateEdited: new Date().getTime(),
        endDate: date.getTime(),
      });
      return changeSelectedDateArray([]);
    }

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [selectedDateArray, docRef]);

  if (result.length === 0) {
    // alert("Announcement doesn't exist");
    void router.push("/announcements");
    return <Loading />;
  }

  return (
    <div>
      {result.map(
        ({
          id,
          type,
          title,
          state,
          endDate,
          message,
          postedBy,
          department,
          // markedDates,
          // dateCreated,
          // dateEdited,
        }) => {
          const date = new Date();
          // const { createdDate, editedDate } = handleEditedCreatedDates(
          //   dateCreated,
          //   dateEdited,
          // );

          date.setTime(endDate);
          // const datesHolder = [
          //   { heading: "Current marked dates:", text: markedDates.toString() },
          //   {
          //     heading: "Date Created:",
          //     text: setUpPrefix(createdDate).replace(/,/, ""),
          //   },
          //   { heading: "Date edited:", text: editedDate.replace(/,/, "") },
          //   { heading: "End date:", text: setUpPrefix(date).replace(/,/, "") },
          // ];

          return (
            <div
              key={id}
              className="relative  min-h-screen animate-gradient-sm bg-gradient-to-t from-primary via-paper to-paper bg-[length:400%_400%] sm:animate-gradient-md md:animate-gradient-lg"
            >
              <div className="absolute z-0 h-screen w-full select-none bg-[url('/bg-login.png')] bg-cover bg-no-repeat opacity-30" />
              <Header />
              <section className="relative z-10 flex flex-col items-center justify-center gap-4">
                <div className="mt-20 grid w-2/3 min-w-max gap-2 rounded-lg bg-primary/50 p-8 text-white shadow-sm ">
                  <div className="relative flex flex-col items-center justify-evenly gap-2 p-6 font-semibold">
                    <button
                      onClick={() => {
                        void deleteDoc(docRef);
                        void router.push("/announcements");
                      }}
                      className="absolute -left-10 -top-10 h-8 w-8 text-secondary"
                    >
                      delete
                    </button>
                    <button
                      onClick={() => {
                        const newState =
                          state === "pinned" ? "unpinned" : "pinned";
                        void updateDoc(docRef, {
                          state: newState,
                          dateEdited: new Date().getTime(),
                        });
                        alert(`Announcement ${newState}!`);
                      }}
                      className="absolute -right-10 -top-10 h-8 w-8"
                    >
                      <Image
                        alt="'pin_icon"
                        className={`${
                          state === "pinned"
                            ? "opacity-100"
                            : "opacity-30 hover:opacity-50"
                        } ease-in0out h-full w-full duration-300`}
                        src={"/pin.png"}
                        {...imageDimension(48)}
                      />
                    </button>
                    <div className="flex w-full items-center justify-center gap-6">
                      <Image
                        alt="'cares._icon"
                        className="h-8 w-8"
                        src="/cares_icon.png"
                        {...imageDimension(48)}
                      />
                      <h1 className="text-2xl font-bold uppercase">{`Department: ${department.toUpperCase()}`}</h1>
                    </div>
                    <h2>{`Posted by: ${postedBy}`}</h2>
                  </div>
                  <div className="mx-auto w-4/5">
                    <Selection
                      value={type}
                      options={announcementType.map((props) => props.type)}
                      onChange={(event) => {
                        if (
                          confirm(
                            `Are you sure you want to change ${type.toUpperCase()} to ${event.currentTarget.value.toUpperCase()}?\nThis announcement will be unavailable for a brief moment after update`,
                          )
                        ) {
                          void updateFromServer(event, "type");
                        }
                      }}
                    />
                  </div>
                  <div className="mx-auto flex w-max items-center justify-center gap-2">
                    <label className="font-semibold" htmlFor="title">
                      Title:
                    </label>
                    <TextInput
                      id="title"
                      type="text"
                      background="bg-white text-black"
                      value={title}
                      condition={false}
                      onChange={(event) =>
                        void updateFromServer(event, "title")
                      }
                    />
                  </div>
                  <div className="flex items-start justify-center gap-2">
                    <label className="font-semibold" htmlFor="message">
                      Message:
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      className="resize-none rounded-lg border border-transparent p-2 text-black shadow-md focus:border-blue-500"
                      onChange={(event) =>
                        void updateFromServer(event, "message")
                      }
                    />
                  </div>
                </div>
                <Calendar />
                <div className="w-max rounded-lg bg-secondary p-4 text-paper shadow-sm">
                  <p className="font-semibold">Dates Info:</p>
                  {/* {datesHolder.map(({ heading, text }, index) => {
                    return (
                      <DateContainer
                        key={index}
                        heading={heading}
                        text={text}
                      />
                    );
                  })} */}
                </div>
              </section>
            </div>
          );
        },
      )}
    </div>
  );
};

// const DateContainer = ({
//   heading,
//   text,
// }: {
//   heading: string;
//   text: string;
// }) => {
//   return (
//     <div className="flex w-2/3 min-w-max items-center justify-between gap-2">
//       <p>{heading}</p>
//       <p>{text}</p>
//     </div>
//   );
// };

export default AnnouncementWithId;
