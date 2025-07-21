import Feed from "./components/Feed";
import Login from "./components/Login";
import { useAuth } from "./hooks/useAuth";

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      {user ? <Feed /> : <Login />}
    </div>
  );
};

export default App;