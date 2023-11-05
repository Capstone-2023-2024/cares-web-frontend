import { collection, doc, getDocs, runTransaction } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type MouseEvent } from "react";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";
import { db } from "~/utils/firebase";
import type {
  AboutType,
  ContainerType,
  ParagaphValuesType,
  ParagraphType,
} from "~/types/about";

const About = () => {
  const NOVALUE = "";
  const { currentUser } = useAuth();
  const [state, setState] = useState<AboutType>({
    summary: NOVALUE,
    vision: NOVALUE,
    mission: NOVALUE,
  });
  const { summary, vision, mission } = state;

  const isValueEmpty = (keyName: ParagraphType["keyName"]): ParagraphType => {
    const condition = state[keyName] === NOVALUE;
    const data = {
      content: condition ? NOVALUE : state[keyName],
      keyName,
    };
    return data;
  };

  useEffect(() => {
    let unsub = true;

    async function setup() {
      try {
        const { docs } = await getDocs(collection(db, "about"));
        const docsHasData = docs.length > 0;
        if (docsHasData) {
          setState(docs[0]?.data() as AboutType);
        }
      } catch (err) {
        console.log(err);
      }
    }
    if (unsub) {
      void setup();
    }
    return () => {
      unsub = true;
    };
  }, []);

  return currentUser !== null ? (
    <Main withPathName>
      <Paragraph
        {...isValueEmpty(
          Object.keys({ summary })[0] as ParagraphType["keyName"]
        )}
      />
      <div className="grid grid-flow-col">
        <Paragraph
          {...isValueEmpty(
            Object.keys({ vision })[0] as ParagraphType["keyName"]
          )}
        />
        <Paragraph
          {...isValueEmpty(
            Object.keys({ mission })[0] as ParagraphType["keyName"]
          )}
        />
      </div>
    </Main>
  ) : (
    <Loading />
  );
};

const Paragraph = ({ content, keyName }: ParagraphType) => {
  const dimension = 20;
  const [values, setValues] = useState<ParagaphValuesType>({
    content,
    isEditing: false,
  });
  const isContentEmpty = values.content === "";
  const rowsOffset = 40;

  function handleState(
    name: keyof ParagaphValuesType,
    value: boolean | string
  ) {
    setValues((prevState) => ({ ...prevState, [name]: value }));
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    handleState("content", event.target.value);
  }

  function handleMouseLeave(event: MouseEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    if (values.isEditing) {
      event.currentTarget.blur();
      handleState("isEditing", false);

      void runTransaction(db, async (tsx) => {
        try {
          const { docs } = await getDocs(collection(db, "about"));
          const docId = docs[0]?.id;
          if (docId) {
            const aboutDocRef = doc(db, `about/${docId}`);
            tsx.update(aboutDocRef, {
              [keyName]: values.content,
            });
          }
        } catch (err) {
          console.log(err);
        }
      });
    }
  }

  function toggleEdit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    handleState("isEditing", !values.isEditing);
  }

  useEffect(() => {
    let unsub = true;
    if (unsub) {
      handleState("content", content);
    }
    return () => {
      unsub = false;
    };
  }, [content]);

  try {
    return (
      <Container bg={keyName === "summary" ? "bg-primary/50" : "bg-primary/10"}>
        <>
          <div className="flex h-full w-full flex-col items-center justify-start gap-2">
            <h2 className="text-xl font-bold uppercase">{keyName}</h2>
            <textarea
              className={`${
                values.isEditing ? "" : "bg-transparent"
              } max-h-[22rem] w-full resize-none p-2 duration-300 ease-in-out`}
              onMouseLeave={handleMouseLeave}
              rows={Math.floor(values.content.length / rowsOffset)}
              disabled={!values.isEditing}
              value={values.content}
              onChange={handleChange}
            />
          </div>
          <button
            className="absolute bottom-6 right-6"
            disabled={isContentEmpty}
            onClick={toggleEdit}
          >
            {isContentEmpty ? (
              <p className="animate-spin">C</p>
            ) : (
              <Image
                src="/pencil.png"
                width={dimension}
                height={dimension}
                alt=""
              />
            )}
          </button>
        </>
      </Container>
    );
  } catch (err) {
    console.log(err);
    return (
      <Container>
        <p className="flex w-full flex-col items-center justify-center">
          400 Bad Request
        </p>
      </Container>
    );
  }
};

const Container = ({ children, bg }: ContainerType) => {
  return (
    <div
      className={`${
        bg ? bg : ""
      } relative mx-auto mt-2 h-max w-5/6 rounded-lg p-4 shadow-md`}
    >
      {children}
    </div>
  );
};

export default About;
