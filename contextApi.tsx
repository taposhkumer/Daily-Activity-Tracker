"use client";

import React, {createContext, useContext, useState, useEffect} from "react";
import {GlobalContextType, defaultGlobalContext} from "./Types/GlobalContextType";
import RewardModal from "./app/components/RewardModal";

const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext);

export const GlobalProvider: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({children}) => {
	const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
	const [pendingRewards, setPendingRewards] = useState<any[]>([]);

	useEffect(() => {
		// fetch pending rewards on mount
		let mounted = true;
		async function fetchPending() {
			try {
				const res = await fetch('/api/rewards/pending');
				if (!res.ok) return;
				const json = await res.json();
				if (mounted) setPendingRewards(json.pending ?? []);
			} catch (e) {
				// ignore
			}
		}
		fetchPending();
		return () => { mounted = false; };
	}, []);

	const refreshPendingRewards = async () => {
		const res = await fetch('/api/rewards/pending');
		if (!res.ok) return;
		const json = await res.json();
		setPendingRewards(json.pending ?? []);
	};

	return (
		<GlobalContext.Provider value={{selectedMenuId, setSelectedMenuId, pendingRewards, refreshPendingRewards}}>
			{children}
			{pendingRewards && pendingRewards.length > 0 ? (
				<RewardModal
					initialRewards={pendingRewards}
					onAcknowledge={refreshPendingRewards}
				/>
			) : null}
		</GlobalContext.Provider>
	);
};

export const useGlobalContext = () => {
	const ctx = useContext(GlobalContext);
	if (!ctx) return defaultGlobalContext;
	return ctx;
};

export default GlobalContext;
