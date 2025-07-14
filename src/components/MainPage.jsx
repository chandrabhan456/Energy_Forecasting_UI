import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/existing');
  };
  
  const handleNavigate1 = () => {
    navigate('/custom');
  };

  return (
   <div className="flex flex-col items-center mt-12 gap-5">
  <div className="flex justify-center gap-5">
    <button
      className="px-6 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 hover:border-blue-700 transition"
      onClick={handleNavigate}
    >
      Forecasting with Pretrained Models
    </button>
    <button
      className="px-6 py-2 rounded-lg border border-green-600 bg-green-600 text-white font-semibold shadow hover:bg-green-700 hover:border-green-700 transition"
      onClick={handleNavigate1}
    >
      Forecast with Custom Data
    </button>
  </div>

  <div className="flex justify-center ml-16 gap-5 mt-4">
  <div className="w-96 h-40 bg-blue-50 bg-opacity-70 backdrop-blur-sm p-4 rounded-lg shadow-md">
    <p>
      Use our pretrained models to quickly generate forecasts. Ideal for users who need fast results and don't have specific data requirements. Benefit from models trained on large datasets for general applicability.
    </p>
  </div>
  <div className="w-96 h-40 bg-blue-50 bg-opacity-70 backdrop-blur-sm p-4 rounded-lg shadow-md">
    <p>
      Customize your forecasts by using your own data. Perfect for users with specific datasets and unique forecasting needs. Gain insights tailored to your business or research parameters.
    </p>
  </div>
</div>

</div>

  );
};

export default MainPage;
