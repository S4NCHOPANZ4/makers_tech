import React from "react";
import { User } from "lucide-react";
import { createGuestSession } from "../middleware/guestSession";

const LoginGuest = () => {
  
  const createGuest = () => {
      console.log('a');
      createGuestSession().then((d) => {
        window.location.reload();
      });
 }
  return (
    <div className="h-full w-full  flex items-center justify-center">
      <div className="flex flex-col items-center justify-center h-full p-8">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Login Required
        </h3>
        <p className="text-gray-500 text-center mb-6">
          Please log in to see personalized recommendations based on your
          preferences.
        </p>
        <button onClick={() => createGuest()} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors">
          Login as Demo User
        </button>
      </div>
    </div>
  );
};

export default LoginGuest;
