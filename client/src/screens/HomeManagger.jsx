import React, { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Admin, ChatBot, Recomendations } from "../Routes";

const HomeManagger = () => {
  return (
    <div className="w-screen h-screen  bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex items-center justify-center ">
      <div className="w-[1200px] h-full   m-auto flex flex-col">
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<Admin/>}/>
                <Route path="/recomendations" element={<Recomendations/>}/>
                <Route path="/" element={<ChatBot/>}/>
            </Routes>
        </BrowserRouter>

      </div>
    </div>
  );
};

export default HomeManagger;
