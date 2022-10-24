import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Router from "./routes";

function App() {
  return (
    <>
      <Router />;
      <ToastContainer />
    </>
  );
}

export default App;
