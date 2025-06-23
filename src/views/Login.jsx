import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons
import "./Login.css";
import center from "../assets/Center.png";
import { Input } from "postcss";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setMainPage, login1, setlogin1 } = useStateContext();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [input, setInput] = React.useState({ email: "", password: "" });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin=async(e) =>{
		
		e.preventDefault();
  
      try{
        const response = await fetch("http://127.0.0.1:5000/api/login", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
  username: input.email,
  password: input.password
}),

        });
 
        const data = await response.json();
        console.log("sssss",data.message)
        if (data.message === 'Login successful!') {
         
          
              localStorage.setItem("login", "true");
      setMainPage(true);
      setlogin1(true);
        } else {
          alert("Invalid Credentials")
        }
      } catch (err) {
        setMessage('Error connecting to server.');
      }
  
    
  };

  return (
    <div className="login">
      
    <div className='centered text-white'>

       <img
              src={center}
              alt="Agent Logo"
              style={{
                width: "45%",
                height: "225px",
                display: "block",
                margin: "0 auto",
              }}
            />
  
    </div>
   
      <div className="login-form">
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="email"
              placeholder="Enter your username"
              onChange={handleChange}
              className="text-input1"
              autoComplete="current-password"
            />
          </div>
          <div className="input-group mt-2" style={{ position: "relative" }}>
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              className="text-input1"
              autoComplete="current-password"
              style={{ paddingRight: "30px" }} // Add padding to accommodate the icon
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-10 cursor-pointer text-xl text-blue-500"
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
          <button className="btn">Login</button>
        </form>
      </div>
    </div>
  );
}
