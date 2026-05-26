"use client";

import React from "react";
import {useUser} from "@clerk/nextjs";
import Sidebar from "../components/SideBar/Sidebar";

function Dashboard() {
    const {user}=useUser();
    
    return (
        <div className="flex">
            <Sidebar/>
            <div className="p-4">
                <h1 className="text-2xl font-bold">Welcome to your Dashboard, {user?.firstName}!</h1>
                <p className="mt-2 text-gray-600">Here you can manage your activities and track your progress.</p>
            </div>
        </div>
    );
}

export default Dashboard;