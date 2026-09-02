/**
 * Элемент списка результатов поиска
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Location } from "../types";
import { COLORS } from "../constants";
import { formatAddress } from "../utils/formatters";

interface Props {
	location: Location;
	onPress: (location: Location) => void;
}

export function SearchResultItem({ location, onPress }: Props) {
	const name = location.name ?? "Неизвестное место";
	const address = formatAddress(location.address);

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => onPress(location)}
			activeOpacity={0.7}
		>
			<Text style={styles.icon}>📍</Text>
			<View style={styles.textContainer}>
				<Text style={styles.name} numberOfLines={2}>
					{name}
				</Text>
				{address ? (
					<Text style={styles.address} numberOfLines={1}>
						{address}
					</Text>
				) : null}
			</View>
			<Text style={styles.arrow}>→</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		marginHorizontal: 16,
		marginVertical: 4,
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	icon: {
		fontSize: 22,
		marginRight: 12,
	},
	textContainer: {
		flex: 1,
	},
	name: {
		fontSize: 15,
		fontWeight: "600",
		color: COLORS.onSurface,
	},
	address: {
		fontSize: 13,
		color: COLORS.onSurfaceVariant,
		marginTop: 3,
	},
	arrow: {
		fontSize: 18,
		color: COLORS.primary,
		marginLeft: 8,
	},
});
