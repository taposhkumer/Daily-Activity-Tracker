"use client";

import React from "react";
import LogoAnName from "../LogoAnName";
import MenuSelection from "./MenuSelection";
import {GlobalProvider} from "../../../contextApi";
import {MenuItemType} from "../../../Types/MenuItemType";

import {
   Home,
   Activity,
   User,
   Calendar
} from "lucide-react";

const defaultMenu: MenuItemType[] = [
	{id: "home", label: "Home", href: "/", icon: <Home size={18} />},
	{id: "activity", label: "Activity Journal", href: "/",icon: <Activity size={18} />},
	{id: "weekly", label: "Weekly Highlights", href: "/",icon: <Calendar size={18} />},
	{id: "profile", label: "Profile", href: "/Profile",icon: <User size={18} />},
];

const Sidebar: React.FC = () => {
	return (
		<GlobalProvider>
			<aside className="bg-black/80 backdrop-blur-md">
				<LogoAnName />
				<nav className="mt-4">
					{defaultMenu.map((m) => (
						<MenuSelection key={m.id} item={m} />
					))}
				</nav>
			</aside>
		</GlobalProvider>
	);
};

export default Sidebar;
