import React, { useEffect, useState } from 'react'
import LoginGuest from './LoginGuest';
import RecomendationsDashboard from './RecomendationsDashboard';
import NavBar from './NavBar';
import { checkSession } from '../middleware/checkSession';
import { logout } from '../middleware/logout';
import AdminDashboard from './AdminDashboard';

const Admin = () => {
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
        {/* {session && session.authenticated ?  */}
        <AdminDashboard/>
         {/* : <LoginGuest/>} */}
      </div>
    </div>
  );
};


export default Admin