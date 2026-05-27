"use client";

import React from "react";
import {MenuItemType} from "../../../Types/MenuItemType";
import {useGlobalContext} from "../../../contextApi";
import Link from "next/link";

type Props = {
	item: MenuItemType;
};

const MenuSelection: React.FC<Props> = ({item}) => {
	const {selectedMenuId, setSelectedMenuId} = useGlobalContext();
	const active = selectedMenuId === item.id;

	const handleClick = () => {
		setSelectedMenuId(item.id);
	};

	return (
		<Link href={item.href || '#'} className="block" onClick={handleClick}>
			<div className={`flex items-center gap-3 rounded-3xl px-4 py-3 transition ${active ? 'bg-slate-800 text-cyan-200 ring-1 ring-cyan-400/20 shadow-sm shadow-cyan-500/10' : 'bg-slate-900/70 text-slate-300 hover:bg-slate-900'}`}>
				{item.icon && <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-cyan-300">{item.icon}</div>}
				<div className="flex-1 text-sm font-medium">{item.label}</div>
				{active && <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_0_6px_rgba(56,189,248,0.12)]" />}
			</div>
		</Link>
	);
};

export default MenuSelection;
