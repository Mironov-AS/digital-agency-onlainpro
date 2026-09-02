/**
 * Экран истории записанных треков
 * Позволяет просматривать, удалять и экспортировать записи
 */
import { useCallback, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { OSMMapView, type MapRef } from "../src/components/OSMMapView";
import { useTripRecording } from "../src/hooks/useTripRecording";
import { formatDistance, formatDuration } from "../src/utils/formatters";
import { COLORS } from "../src/constants";
import type { Track } from "../src/hooks/useTripRecording";

export default function TracksScreen() {
	const router = useRouter();
	const { savedTracks, deleteTrack, clearAllTracks, loadTracks } =
		useTripRecording();

	const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
	const mapRef = { current: null as any };

	const handleDelete = useCallback(
		(track: Track) => {
			Alert.alert(
				"Удалить трек?",
				`"${track.name}" — ${formatDistance(track.distanceMeters)}`,
				[
					{ text: "Отмена", style: "cancel" },
					{
						text: "Удалить",
						style: "destructive",
						onPress: () => deleteTrack(track.id),
					},
				],
			);
		},
		[deleteTrack],
	);

	const handleClearAll = useCallback(() => {
		Alert.alert(
			"Удалить все треки?",
			`${savedTracks.length} треков будет удалено безвозвратно`,
			[
				{ text: "Отмена", style: "cancel" },
				{
					text: "Удалить всё",
					style: "destructive",
					onPress: clearAllTracks,
				},
			],
		);
	}, [savedTracks.length, clearAllTracks]);

	const handleExportGPX = useCallback((track: Track) => {
		// Генерация GPX файла
		const gpx = generateGPX(track);
		Alert.alert(
			"Экспорт GPX",
			`Трек "${track.name}" готов к экспорту.\n\nФункция экспорта будет доступна в следующей версии.`,
			[{ text: "OK" }],
		);
	}, []);

	const handleTrackPress = useCallback((track: Track) => {
		setSelectedTrack(track);
	}, []);

	const formatDate = (timestamp: number) => {
		const d = new Date(timestamp);
		return d.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderItem = ({ item }: { item: Track }) => (
		<TouchableOpacity
			style={styles.trackCard}
			onPress={() => handleTrackPress(item)}
			activeOpacity={0.7}
		>
			<View style={styles.trackHeader}>
				<Text style={styles.trackName}>{item.name}</Text>
				<Text style={styles.trackDate}>{formatDate(item.startTime)}</Text>
			</View>

			<View style={styles.trackStats}>
				<View style={styles.trackStat}>
					<Text style={styles.trackStatValue}>
						{formatDistance(item.distanceMeters)}
					</Text>
					<Text style={styles.trackStatLabel}>Расстояние</Text>
				</View>
				<View style={styles.trackStatDivider} />
				<View style={styles.trackStat}>
					<Text style={styles.trackStatValue}>
						{formatDuration(item.durationSeconds)}
					</Text>
					<Text style={styles.trackStatLabel}>В пути</Text>
				</View>
				<View style={styles.trackStatDivider} />
				<View style={styles.trackStat}>
					<Text style={styles.trackStatValue}>{item.points.length}</Text>
					<Text style={styles.trackStatLabel}>Точек</Text>
				</View>
			</View>

			<View style={styles.trackActions}>
				<TouchableOpacity
					style={styles.actionBtn}
					onPress={() => handleExportGPX(item)}
				>
					<Text style={styles.actionBtnText}>📤 Экспорт</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.actionBtn, styles.actionBtnDanger]}
					onPress={() => handleDelete(item)}
				>
					<Text style={styles.actionBtnTextDanger}>🗑️</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.backBtn}>← Назад</Text>
				</TouchableOpacity>
				<Text style={styles.title}>📍 История треков</Text>
				<View style={{ width: 60 }} />
			</View>

			{/* Storage info */}
			<View style={styles.storageInfo}>
				<Text style={styles.storageText}>
					Сохранено: {savedTracks.length} треков
				</Text>
				{savedTracks.length > 0 && (
					<TouchableOpacity onPress={handleClearAll}>
						<Text style={styles.clearAllText}>Очистить всё</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Tracks list */}
			{savedTracks.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyIcon}>🗺️</Text>
					<Text style={styles.emptyTitle}>Нет записанных треков</Text>
					<Text style={styles.emptySubtitle}>
						Во время навигации нажмите кнопку записи (⏺) чтобы начать запись
						маршрута
					</Text>
				</View>
			) : (
				<FlatList
					data={savedTracks}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}

			{/* Track preview modal */}
			<Modal
				visible={selectedTrack !== null}
				animationType="slide"
				onRequestClose={() => setSelectedTrack(null)}
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalTitle}>{selectedTrack?.name ?? ""}</Text>
						<TouchableOpacity onPress={() => setSelectedTrack(null)}>
							<Text style={styles.closeBtn}>✕</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.modalStats}>
						<Text style={styles.modalStatText}>
							📏{" "}
							{selectedTrack
								? formatDistance(selectedTrack.distanceMeters)
								: ""}
						</Text>
						<Text style={styles.modalStatText}>
							⏱️{" "}
							{selectedTrack
								? formatDuration(selectedTrack.durationSeconds)
								: ""}
						</Text>
						<Text style={styles.modalStatText}>
							📍 {selectedTrack?.points.length ?? 0} точек
						</Text>
					</View>

					<View style={styles.mapContainer}>
						<OSMMapView
							ref={mapRef}
							style={styles.modalMap}
							route={
								selectedTrack
									? {
											points: selectedTrack.points.map((p) => ({
												latitude: p.lat,
												longitude: p.lon,
											})),
											distanceMeters: selectedTrack.distanceMeters,
											durationSeconds: selectedTrack.durationSeconds,
											instructions: [],
										}
									: null
							}
							destination={
								selectedTrack && selectedTrack.points.length > 0
									? {
											latitude:
												selectedTrack.points[selectedTrack.points.length - 1]
													.lat,
											longitude:
												selectedTrack.points[selectedTrack.points.length - 1]
													.lon,
										}
									: null
							}
							zoom={14}
						/>
					</View>

					<TouchableOpacity
						style={styles.modalCloseBtn}
						onPress={() => setSelectedTrack(null)}
					>
						<Text style={styles.modalCloseBtnText}>Закрыть</Text>
					</TouchableOpacity>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

function generateGPX(track: Track): string {
	const points = track.points
		.map(
			(p) =>
				`      <trkpt lat="${p.lat}" lon="${p.lon}">
        <time>${new Date(p.timestamp).toISOString()}</time>
        ${p.speed !== undefined ? `<speed>${p.speed}</speed>` : ""}
      </trkpt>`,
		)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OSM Navigator"
  xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${track.name}</name>
    <time>${new Date(track.startTime).toISOString()}</time>
  </metadata>
  <trk>
    <name>${track.name}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	backBtn: {
		fontSize: 16,
		color: COLORS.primary,
		fontWeight: "600",
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.onSurface,
	},
	storageInfo: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 10,
		backgroundColor: "#f5f5f5",
	},
	storageText: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
	},
	clearAllText: {
		fontSize: 14,
		color: COLORS.error,
		fontWeight: "600",
	},
	listContent: {
		padding: 16,
		gap: 12,
	},
	trackCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	trackHeader: {
		marginBottom: 12,
	},
	trackName: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.onSurface,
		marginBottom: 4,
	},
	trackDate: {
		fontSize: 13,
		color: COLORS.onSurfaceVariant,
	},
	trackStats: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	trackStat: {
		flex: 1,
		alignItems: "center",
	},
	trackStatValue: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.primary,
	},
	trackStatLabel: {
		fontSize: 11,
		color: COLORS.onSurfaceVariant,
		marginTop: 2,
	},
	trackStatDivider: {
		width: 1,
		height: 30,
		backgroundColor: "#eee",
	},
	trackActions: {
		flexDirection: "row",
		gap: 10,
	},
	actionBtn: {
		flex: 1,
		backgroundColor: "#f0f0f0",
		borderRadius: 10,
		paddingVertical: 10,
		alignItems: "center",
	},
	actionBtnText: {
		fontSize: 14,
		color: COLORS.onSurface,
		fontWeight: "600",
	},
	actionBtnDanger: {
		flex: 0,
		paddingHorizontal: 16,
		backgroundColor: "#ffebee",
	},
	actionBtnTextDanger: {
		fontSize: 18,
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.onSurface,
		marginBottom: 8,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
		textAlign: "center",
		lineHeight: 20,
	},
	// Modal
	modalContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	modalHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.onSurface,
		flex: 1,
	},
	closeBtn: {
		fontSize: 24,
		color: COLORS.onSurfaceVariant,
		padding: 4,
	},
	modalStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 12,
		backgroundColor: "#f5f5f5",
	},
	modalStatText: {
		fontSize: 14,
		color: COLORS.onSurface,
		fontWeight: "600",
	},
	mapContainer: {
		flex: 1,
		margin: 16,
		borderRadius: 16,
		overflow: "hidden",
	},
	modalMap: {
		flex: 1,
	},
	modalCloseBtn: {
		backgroundColor: COLORS.primary,
		borderRadius: 16,
		paddingVertical: 16,
		marginHorizontal: 16,
		marginBottom: 16,
		alignItems: "center",
	},
	modalCloseBtnText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#fff",
	},
});
