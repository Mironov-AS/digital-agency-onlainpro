import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../src/i18n";

export default function RootLayout() {
	return (
		<>
			<StatusBar style="dark" />
			<Stack
				screenOptions={{
					headerShown: false,
					animation: "slide_from_right",
					contentStyle: { backgroundColor: "#FAFAFA" },
				}}
			/>
		</>
	);
}
