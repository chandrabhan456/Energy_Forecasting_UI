import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHistory, addHistoryItem, clearHistory } from '../utils/historyDb'; // Adjust path as needed

const StateContext = createContext();

const initialState = {
  setting: false,
  notification: false,
  userProfile: false,
};

export const ContextProvider = ({ children }) => {
  // Login state (still using localStorage)
  let initialLoginState = localStorage.getItem('login');
  if (initialLoginState === null || initialLoginState === 'false') {
    localStorage.setItem('login', 'false');
    initialLoginState = false;
  } else {
    initialLoginState = localStorage.getItem('login') === 'true';
  }
  const [activeMenu, setActiveMenu] = useState(localStorage.getItem('openAI_Configuration') || true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [mainPage, setMainPage] = useState(false);
  const [login1, setlogin1] = useState(initialLoginState);
  const [csvFile1, setCsvFile1] = useState(null)
  const [activeHistory, setActiveHistory] = useState(false)
  const [activeSessionName, setActiveSessionName] = useState(null);
  // CSV history state (now using IndexedDB)
  const [history, setHistory] = useState([]);

  // Load history from IndexedDB on mount
  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  // Helper to add a history item
  const addHistory = async (item) => {
    console.log("Adding to history:", item);
    await addHistoryItem(item);
    const updated = await getHistory();
    console.log("Updated history:", updated);
    setHistory(updated);
  };


  // Helper to clear history
  const clearCsvHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  // Keep login state in sync with localStorage
  useEffect(() => {
    localStorage.setItem('login', login1);
  }, [login1]);

  return (
    <StateContext.Provider
      value={{
        login1,
        setlogin1,
        activeHistory,
        setActiveHistory,
        history,
        setHistory,
        activeSessionName,
        setActiveSessionName,
        csvFile1,
        setCsvFile1,
        addHistory,      // Async add
        clearCsvHistory, // Async clear
        mainPage,
        setMainPage,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
