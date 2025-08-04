import React from "react";
import icon from "/icon.svg";
import { useNavigate, useLocation  } from "react-router-dom";
function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const segmentos = location.pathname.split('/');
  return (
    <div className="py-4 text-white font-extrabold text-[1.3rem] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-[60px] h-[60px]">
          <img src={icon} alt="icon" />
        </div>
        <p>Makers Tech</p>
      </div>
      <div className="bg-gray-800 px-10 py-2 rounded-full font-normal text font-medium text-[15px] flex items-center gap-5 ">
        <div className={`cursor-pointer ${location.pathname == "/" ? "font-semibold text-white " :"text-zinc-400"}`} onClick={()=> navigate('/')}>Chat Bot</div>
        <div className={`cursor-pointer ${location.pathname == "/recomendations" ? "font-semibold text-white " :"text-zinc-400"}`} onClick={()=> navigate('/recomendations')}>Recommendations</div>
        <div className={`cursor-pointer ${location.pathname == "/dashboard" ? "font-semibold text-white " :"text-zinc-400"}`} onClick={()=> navigate('/dashboard')}>Admin Dashboard</div>
        <div className="cursor-pointer" onClick={()=> navigate('/dashboard')}>{}</div>
      </div>
    </div>
  );
}

export default NavBar;
