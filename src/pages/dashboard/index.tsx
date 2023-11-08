import Loading, { BoxContainer } from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";
import DashboardProvider, { useDashboard } from "~/contexts/DashbroadProvider";

const Dashboard = () => {
  const { currentUser } = useAuth();

  // useEffect(() => {
  //   async function setup() {
  //     try {
  //       if (currentUser === null) {
  //         await router.replace("login");
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  //   return void setup();
  // }, [currentUser, router]);

  return currentUser === null ? (
    <Loading />
  ) : (
    <DashboardProvider>
      <Content />
    </DashboardProvider>
  );
};

const Content = () => {
  const { countData } = useDashboard();
  const { typeOfAccount, currentUser, signout } = useAuth();
  const permission = typeOfAccount?.replace(/_/g, " ");
  const placeholder = { name: "null", count: -1 };

  function handleLogout() {
    void signout();
  }

  return (
    <Main>
      <h2 className="text-center text-lg">Announcement summary</h2>
      <section className="grid grid-cols-2 gap-2 p-2">
        {countData.length === 0 &&
          new Array(4).fill(placeholder).map((v, index) => {
            console.log(v);
            return (
              <div
                key={index}
                className="rounded-lg border border-primary p-2 text-center"
              >
                <h3 className="font-bold capitalize">{`Fetching data...`}</h3>
                <div className="scale-50">
                  <BoxContainer />
                </div>
              </div>
            );
          })}
        {countData.map(({ name, count }) => {
          return (
            <div
              key={name}
              className="rounded-lg border border-primary p-2 text-center"
            >
              <h3 className="font-bold capitalize">{`${name.replace(
                /_/g,
                " "
              )}(s):`}</h3>
              <p>{count}</p>
            </div>
          );
        })}
      </section>
      <div className="flex flex-col items-center justify-center gap-2 capitalize">
        {permission !== null && <p>{`${permission} privileges`}</p>}
        <p>
          email:
          <span className="font-bold lowercase">{` ${currentUser?.email}`}</span>
        </p>
        <button
          className="rounded-xl bg-red-500 p-2 capitalize text-white"
          onClick={handleLogout}
        >
          logout
        </button>
      </div>
    </Main>
  );
};

export default Dashboard;
