/**
 * Типы навигации
 */
import type { Location, Route } from "./index";

export type RootStackParamList = {
	Main: undefined;
	Search: {
		onSelect?: (location: Location) => void;
	};
	Navigation: {
		destination: Location;
		route?: Route;
	};
	Settings: undefined;
};
