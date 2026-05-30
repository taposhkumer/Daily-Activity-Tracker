export interface GlobalContextType {
	selectedMenuId: string | null;
	setSelectedMenuId: (id: string | null) => void;
  pendingRewards?: any[];
  refreshPendingRewards?: () => Promise<void>;
}

export const defaultGlobalContext: GlobalContextType = {
	selectedMenuId: null,
	setSelectedMenuId: () => {},
  pendingRewards: [],
  refreshPendingRewards: async () => {},
};
