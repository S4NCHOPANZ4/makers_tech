import React from "react";
import NavBar from "./NavBar";
import { useEffect } from "react";
import { checkSession } from "../middleware/checkSession";
import { useState } from "react";
import LoginGuest from "./LoginGuest";
import { logout } from "../middleware/logout";
import RecomendationsDashboard from "./RecomendationsDashboard";

const Recomendations = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    checkSession().then((data) => {
      setSession(data);
      
    });
  }, []);

  const logoutHandler = () => {
    logout().then((data) => {
      setSession(null);
      window.location.reload();
    })
  }


  return (
    <div className="flex-1 flex flex-col h-screen">
      <NavBar />
      <div className={`flex-1  overflow-y-auto scrollable`}>
        {session && session.authenticated ? 
        <RecomendationsDashboard/>
        : <LoginGuest/>}
      </div>
    </div>
  );
};

export default Recomendations;
