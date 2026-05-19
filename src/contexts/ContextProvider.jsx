import React, { createContext, useContext, useState, useEffect } from 'react';
const StateContext = createContext();


export const ContextProvider = ({ children }) => {
 const [user, setUser] = useState({
   name: "Michael",
   email: "michael@example.com",
   role: "user", // "user" or "admin"
   avatar: "M",
 });
 const [role,setRole] = useState('user')
 const [login,setlogin]= useState(false)
  return (
    <StateContext.Provider
      value={{
        user,
        setUser,
        login,
        setlogin,
        role,
        setRole,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
