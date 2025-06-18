import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import {  useStateContext } from "../contexts/ContextProvider";
import "./Sidebar.css";
  
import Chatbot from "../assets/energy.png";
const Sidebar = () => {
   const navigate = useNavigate();
 
  const handleNavigation = (path) => {
    navigate(path);
  };

    const buttonStyles = (path) => ({
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
 
    color: location.pathname === path ? "#0D85D8" : "#000000",
    cursor: "pointer",
  
    border: "none",
    textAlign: "left",
    textDecoration: "none",
    fontSize: "1.25rem",
  });     


  return (
  <div className="w-80  p-4 mt-1 h-[90%] overflow-y-auto custom-scrollbar overflow-x-hidden">
     <div style={{ textAlign: "center", marginTop: "5px" }}>
            <img
              src={Chatbot}
              alt="Agent Logo"
              style={{
                width: "75%",
                height: "165px",
               
                  display: "block",
                margin: "0 auto",
              }}
            />
              
          </div>
      {/* Add your image here */}
     </div>
  );
};

export default Sidebar;