import React, { useEffect, useState } from "react";

import { Link, NavLink, useNavigate, Navigate } from "react-router-dom";

import { useStateContext } from "../contexts/ContextProvider";
import logo from "../assets/cvlogo.png";
import "./navbar.css";
import UserDropdown from "./UserDropdown";
const Navbar = () => {
  const {} = useStateContext();
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between md:mx-0  relative w-full ">
        <div className="flex" style={{ marginTop: "-13px" }}>
          <img
            style={{ width: "324px", marginLeft: "-5px", marginTop: "5px" }}
            className=""
            src={logo}
            alt="logo"
          />
          <div
            className="mt-6 font-bold ml-2 text-2xl "
            style={{ cursor: "pointer" }}
          >
            TalentScope
          </div>
        </div>

        <div
          className={`relative inline-flex rounded-full h-2 right-4 top-2.5`}
        >
          <div
            style={{ marginLeft: "-30px" }}
            className="flex items-center justify-center mt-1.5 cursor-pointer"
          >
            <div className="mt-2">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
