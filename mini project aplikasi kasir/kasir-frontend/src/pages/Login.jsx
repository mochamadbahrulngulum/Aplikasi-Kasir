import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/dashboard", { replace: true });
  }
}, [navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        alert("Token tidak ditemukan!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login gagal!");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <div className="bg-[#264de4] h-[50vh] px-10 pt-6 flex justify-between items-start">
        <h1 className="text-white font-bold text-2xl">MAS POS</h1>
        <span className="text-white text-sm mt-1">Call Us +62 817-1902-092</span>
      </div>

      <div className="bg-white h-[50vh] relative">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-md p-8 w-[380px]">
          <h2 className="text-center text-xl font-semibold mb-6">Login</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 font-medium">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#264de4] hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
