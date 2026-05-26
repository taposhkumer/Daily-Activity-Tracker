export interface GlobalContextType {
	selectedMenuId: string | null;
	setSelectedMenuId: (id: string | null) => void;
}

export const defaultGlobalContext: GlobalContextType = {
	selectedMenuId: null,
	setSelectedMenuId: () => {},
};
