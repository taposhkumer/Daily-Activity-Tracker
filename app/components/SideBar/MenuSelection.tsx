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
		<Link href={item.href || '#'} className={`block`} onClick={handleClick}>
			<div className={`px-4 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 ${active
? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
: "text-gray-600"}`}>
				{item.icon && <div className="flex-shrink-0">{item.icon}</div>}
				<div className="flex-1">{item.label}</div>
			</div>
		</Link>
	);
};

export default MenuSelection;
