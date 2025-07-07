import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/existing');
  };
  
  const handleNavigate1 = () => {
    navigate('/dataPage');
  };

  return (
    <div className="flex justify-center mt-12 gap-5">
      <button
        className="px-6 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 hover:border-blue-700 transition"
        onClick={handleNavigate}
      >
        Forecast with Existing Models
      </button>
      <button
        className="px-6 py-2 rounded-lg border border-green-600 bg-green-600 text-white font-semibold shadow hover:bg-green-700 hover:border-green-700 transition"
        onClick={handleNavigate1}
      >
        Forecast with Custom Data
      </button>
    </div>
  );
};

export default MainPage;
