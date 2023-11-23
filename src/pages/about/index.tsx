import { collection, doc, getDocs, runTransaction } from "firebase/firestore";
import Image from "next/image";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthProvider";
import { db } from "~/utils/firebase";

interface AboutProps {
  summary: string;
  vision: string;
  mission: string;
}
interface ParagraphProps {
  keyName: keyof AboutProps;
  content: string;
}
interface ParagaphStateProps extends ParagraphProps {
  isEditing: boolean;
}
interface ContainerProps {
  children: ReactNode;
  bg?: string;
}

const About = () => {
  const EMPTY_STRING = "";
  const { currentUser } = useAuth();
  const [state, setState] = useState<AboutProps>({
    summary: EMPTY_STRING,
    vision: EMPTY_STRING,
    mission: EMPTY_STRING,
  });

  const isValueEmpty = (keyName: keyof AboutProps) => {
    const condition = state[keyName] === EMPTY_STRING;
    const data = {
      content: condition ? EMPTY_STRING : state[keyName],
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
          setState(docs[0]?.data() as AboutProps);
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
      <Paragraph {...isValueEmpty("summary")} />
      <div className="grid grid-flow-col">
        <Paragraph {...isValueEmpty("vision")} />
        <Paragraph {...isValueEmpty("mission")} />
      </div>
    </Main>
  ) : (
    <Loading />
  );
};

const Paragraph = ({ content, keyName }: ParagraphProps) => {
  const dimension = 20;
  const [values, setValues] = useState<Omit<ParagaphStateProps, "keyName">>({
    content,
    isEditing: false,
  });
  const isContentEmpty = values.content === "";
  const rowsOffset = 40;

  function handleState(
    name: keyof ParagaphStateProps,
    value: boolean | string,
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

const Container = ({ children, bg }: ContainerProps) => {
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
