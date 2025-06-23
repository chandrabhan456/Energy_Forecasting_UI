import { useState } from "react";
import "./App.css";
import Login from "./views/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, Sidebar } from "./views";
import { useStateContext } from "./contexts/ContextProvider.jsx";
import { DataPage } from "./components";
import FileViewer from "./views/FileViewer.jsx";


function App() {
  localStorage.setItem("OpenAI_Configuration", true);
  localStorage.removeItem("login");
  const { mainPage, login1, setlogin1 } = useStateContext();
  
  // const [history, setHistory] = useState([]);

  // const [history, setHistory] = useState([
  //   { sessionName: 'Session 1', files: [{ name: 'test1.csv' }] },
  //   { sessionName: 'Session 2', files: [{ name: 'test2.csv' }] }
  // ]);

  return (
    <div>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {!login1 ? (
          <Login />
        ) : (
          <div className="flex flex-col min-h-screen">
            {/* Navbar - Full Width at Top */}
            <div className="fixed top-0 left-0 w-full  z-50 shadow-md custom-navbar">
              <Navbar />
            </div>

            {/* Sidebar & Content Container (Below Navbar) */}
            <div className="flex flex-row mt-12">
              {/* Sidebar - Fixed on Left */}
              <div className="w-80 h-screen fixed left-0 top-12 bg-gray-100 ">
                <Sidebar/>
              </div>

              {/* Main Content - Takes Remaining Space */}
              <div
                className={`transition-all duration-300 w-full overflow-x-hidden ml-80`}
              >
                <Routes>
                  <>
                    <Route path="/" element={<DataPage />} />
                    
                    {/* <Route path="/view-file" element={<FileViewer />} /> */}
                    <Route path="/view" element={<FileViewer />} />  {/* <-- add this */}
                  </>
                </Routes>
              </div>
            </div>
          </div>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
