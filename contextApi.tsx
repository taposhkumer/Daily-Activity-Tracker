"use client";

import React, {createContext, useContext, useState} from "react";
import {GlobalContextType, defaultGlobalContext} from "./Types/GlobalContextType";

const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext);

export const GlobalProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({children}) => {
	const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

	return (
		<GlobalContext.Provider value={{selectedMenuId, setSelectedMenuId}}>
			{children}
		</GlobalContext.Provider>
	);
};

export const useGlobalContext = () => {
	const ctx = useContext(GlobalContext);
	if (!ctx) return defaultGlobalContext;
	return ctx;
};

export default GlobalContext;
