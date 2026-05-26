import type {ReactNode} from "react";

export interface MenuItemType {
	id: string;
	label: string;
	href?: string;
	icon?: ReactNode;
}

export type MenuItems = MenuItemType[];
