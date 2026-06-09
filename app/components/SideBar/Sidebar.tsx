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
   Calendar,
   Goal,
   Zap,
} from "lucide-react";

const defaultMenu: MenuItemType[] = [
	{id: "home", label: "Home", href: "/", icon: <Home size={18} />},
	{id: "daily", label: "Daily Overview", href: "/dashboard/daily", icon: <Zap size={18} />},
	{id: "activity", label: "This Week", href: "/dashboard/weekly", icon: <Calendar size={18} />},
	{id: "analysis", label: "Analysis", href: "/dashboard/analysis", icon: <Calendar size={18} />},
	{id: "goal", label: "Goal", href: "/dashboard/goals", icon: <Goal size={18} />},
	{id: "profile", label: "Profile", href: "/Profile", icon: <User size={18} />},
];

const Sidebar: React.FC = () => {
	return (
		<GlobalProvider>
			<aside className="w-72 min-h-screen px-5 py-6 bg-slate-950 text-slate-100 border-r border-slate-800 shadow-[0_20px_80px_rgba(15,23,42,0.35)] flex flex-col justify-between">
				<div className="space-y-4">
					<LogoAnName />

					<nav className="space-y-3">
						{defaultMenu.map((m) => (
							<MenuSelection key={m.id} item={m} />
						))}
					</nav>
				</div>

				<div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-inner shadow-slate-950/30">
					<div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
						Live
					</div>
					
				</div>
			</aside>
		</GlobalProvider>
	);
};

export default Sidebar;
