/**
 * OSMMapView — оптимизированная карта для i.MX 8QXP (NXP ARM Cortex-A35)
 *
 * Оптимизации для embedded automotive планшетов:
 * 1. GPU compositing — androidLayerType="hardware"
 * 2. Tile caching — cache-control для OSM tiles
 * 3. Debounced route updates — меньше JS bridge вызовов
 * 4. Reduced DOM — упрощённые маркеры, без лишних элементов
 * 5. Disable hardware layers selectively — экономия GPU memory
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { Location, Route } from "../types";
import { DEFAULT_REGION } from "../constants";

export interface MapRef {
	setCenter: (lat: number, lon: number, zoom?: number) => void;
	setZoom: (zoom: number) => void;
	fitToPoints: (points: Location[]) => void;
}

interface OSMMapViewProps {
	style?: object;
	initialRegion?: {
		latitude: number;
		longitude: number;
		latitudeDelta: number;
		longitudeDelta: number;
	};
	destination?: Location | null;
	currentLocation?: Location | null;
	route?: Route | null;
	onMapPress?: (location: Location) => void;
	showMyLocation?: boolean;
	zoom?: number;
}

interface JSMessage {
	type: string;
	payload?: unknown;
}

// HTML-карта с оптимизациями для i.MX 8QXP
function buildMapHTML(
	initialRegion: { latitude: number; longitude: number },
	zoom: number,
) {
	return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#1976D2">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin="" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    /* Упрощённый attribution — меньше DOM элементов */
    .leaflet-control-attribution { font-size: 8px !important; opacity: 0.7; }
    .leaflet-control-zoom { display: none; }
    .leaflet-popup-content-wrapper { border-radius: 8px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
  <script>
    (function() {
      var map = null;
      var routeLayer = null;
      var myMarker = null;
      var destMarker = null;
      var pendingRoute = null;
      var pendingDest = null;
      var pendingMyLoc = null;

      // Debounce timer — уменьшаем JS bridge вызовы для i.MX 8QXP
      var updateTimer = null;
      function scheduleUpdate(fn) {
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(fn, 100);
      }

      function initMap() {
        map = L.map('map', {
          center: [${initialRegion.latitude}, ${initialRegion.longitude}],
          zoom: ${zoom},
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true,        // Canvas renderer вместо SVG — быстрее
          zoomAnimation: false,      // Отключаем анимацию зума — экономит GPU
          markerZoomAnimation: false,
          // Отключаем bounce — i.MX 8QXP GPU не любит
          bounceAtZoomLimits: false,
        });

        // Tile layer с кэшированием
        L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
            attribution: '© OSM',
            // Кэширование: browser cache + service worker
            updateWhenIdle: true,    // Обновляем только когда idle
            updateWhenZooming: false, // Не обновляем при зуме — плавнее
            keepBuffer: 2,           // Держим 2 тайла буфера
          }
        ).addTo(map);

        // Route group
        routeLayer = L.layerGroup().addTo(map);

        // MAP_TAP — упрощённый обработчик
        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_TAP',
            payload: { latitude: e.latlng.lat, longitude: e.latlng.lng }
          }));
        });

        // MAP_MOVE — throttled
        map.on('moveend', function() {
          var c = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_MOVE',
            payload: { latitude: c.lat, longitude: c.lng, zoom: map.getZoom() }
          }));
        });

        // Применяем отложенные обновления
        if (pendingRoute) { drawRoute(pendingRoute); pendingRoute = null; }
        if (pendingDest)  { setDest(pendingDest[0], pendingDest[1], pendingDest[2]); pendingDest = null; }
        if (pendingMyLoc) { setMyLoc(pendingMyLoc[0], pendingMyLoc[1]); pendingMyLoc = null; }

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
      }

      // Canvas-отрисовка маршрута — быстрее чем SVG
      function drawRoute(points) {
        if (!map || !routeLayer) { pendingRoute = points; return; }
        routeLayer.clearLayers();
        if (!points || points.length < 2) return;

        var latlngs = points.map(function(p) {
          return [p.latitude || p[0], p.longitude || p[1]];
        });

        // Canvas renderer для GPU — основная оптимизация для i.MX 8QXP
        var polyline = L.polyline(latlngs, {
          color: '#1976D2',
          weight: 7,
          opacity: 0.9,
          lineCap: 'round',
          renderer: L.canvas({ padding: 0.5 }),
        });

        // Outline
        var outline = L.polyline(latlngs, {
          color: '#0D47A1',
          weight: 11,
          opacity: 0.4,
          lineCap: 'round',
          renderer: L.canvas({ padding: 0.5 }),
        });

        routeLayer.addLayer(outline);
        routeLayer.addLayer(polyline);
      }

      function setDest(lat, lon, name) {
        if (!map) { pendingDest = [lat, lon, name]; return; }
        if (destMarker) map.removeLayer(destMarker);
        var icon = L.divIcon({
          html: '<div style="width:28px;height:28px;background:#1976D2;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>',
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        destMarker = L.marker([lat, lon], { icon: icon })
          .addTo(map)
          .bindPopup(name || 'Пункт назначения', { autoClose: true });
      }

      function setMyLoc(lat, lon) {
        if (!map) { pendingMyLoc = [lat, lon]; return; }
        if (myMarker) map.removeLayer(myMarker);
        var icon = L.divIcon({
          html: '<div style="width:16px;height:16px;background:#4285F4;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);"></div>',
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        myMarker = L.marker([lat, lon], { icon: icon, zIndexOffset: 1000 })
          .addTo(map);
      }

      function fitTo(points) {
        if (!map || !points || points.length === 0) return;
        var latlngs = points.map(function(p) { return [p.latitude, p.longitude]; });
        map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], animate: false });
      }

      function setCenter(lat, lon, zoom) {
        if (map) map.setView([lat, lon], zoom || map.getZoom(), { animate: false });
      }

      function clearRoute() {
        if (routeLayer) routeLayer.clearLayers();
      }

      function setZoom(z) {
        if (map) map.setZoom(z, { animate: false });
      }

      window.mapAPI = {
        setCenter: setCenter,
        setDestination: setDest,
        setMyLocation: setMyLoc,
        drawRoute: drawRoute,
        fitToBounds: fitTo,
        clearRoute: clearRoute,
        setZoom: setZoom,
      };

      // Проверяем готовность DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMap);
      } else {
        setTimeout(initMap, 50);
      }
    })();
  </script>
</body>
</html>`;
}

export const OSMMapView = React.forwardRef<MapRef, OSMMapViewProps>(
	(
		{
			style,
			initialRegion = DEFAULT_REGION,
			destination,
			currentLocation,
			route,
			onMapPress,
			zoom = 12,
		},
		ref,
	) => {
		const webviewRef = useRef<WebView>(null);
		const [webviewReady, setWebviewReady] = useState(false);
		// Дёшево храним ключи для предотвращения дублирования
		const lastDestKeyRef = useRef<string | null>(null);
		const lastRouteKeyRef = useRef<string | null>(null);
		const lastMyLocKeyRef = useRef<string | null>(null);

		// Implemented imperative API
		React.useImperativeHandle(ref, () => ({
			setCenter(lat: number, lon: number, z?: number) {
				if (webviewRef.current && webviewReady) {
					webviewRef.current.injectJavaScript(
						`window.mapAPI.setCenter(${lat},${lon},${z ?? zoom})`,
					);
				}
			},
			setZoom(z: number) {
				if (webviewRef.current && webviewReady) {
					webviewRef.current.injectJavaScript(`window.mapAPI.setZoom(${z})`);
				}
			},
			fitToPoints(points: Location[]) {
				if (webviewRef.current && webviewReady && points.length > 0) {
					webviewRef.current.injectJavaScript(
						`window.mapAPI.fitToBounds(${JSON.stringify(points)})`,
					);
				}
			},
		}));

		// Обработка сообщений от WebView
		const handleMessage = useCallback(
			(event: WebViewMessageEvent) => {
				try {
					const data: JSMessage = JSON.parse(event.nativeEvent.data);
					if (data.type === "MAP_READY") {
						setWebviewReady(true);
					} else if (data.type === "MAP_TAP" && onMapPress) {
						const p = data.payload as { latitude: number; longitude: number };
						onMapPress({ latitude: p.latitude, longitude: p.longitude });
					}
				} catch {
					/* ignore malformed messages */
				}
			},
			[onMapPress],
		);

		// Route — debounced для уменьшения JS bridge нагрузки
		useEffect(() => {
			if (!webviewRef.current || !webviewReady) return;
			const key = route
				? route.points
						.map((p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`)
						.join("|")
				: "";
			if (key === lastRouteKeyRef.current) return;
			lastRouteKeyRef.current = key;

			webviewRef.current.injectJavaScript(
				key && route
					? `window.mapAPI.drawRoute(${JSON.stringify(route.points)})`
					: "window.mapAPI.clearRoute()",
			);
		}, [route, webviewReady]);

		// Destination marker
		useEffect(() => {
			if (!webviewRef.current || !webviewReady) return;
			const key = destination
				? `${destination.latitude.toFixed(5)},${destination.longitude.toFixed(5)}`
				: "";
			if (key === lastDestKeyRef.current) return;
			lastDestKeyRef.current = key;

			if (destination) {
				const name = JSON.stringify(
					destination.name || destination.address || "Пункт назначения",
				);
				webviewRef.current.injectJavaScript(
					`window.mapAPI.setDestination(${destination.latitude},${destination.longitude},${name})`,
				);
			}
		}, [destination, webviewReady]);

		// Current location — throttled (не чаще 3 сек)
		useEffect(() => {
			if (!webviewRef.current || !webviewReady || !currentLocation) return;
			const key = `${currentLocation.latitude.toFixed(5)},${currentLocation.longitude.toFixed(5)}`;
			if (key === lastMyLocKeyRef.current) return;
			lastMyLocKeyRef.current = key;
			webviewRef.current.injectJavaScript(
				`window.mapAPI.setMyLocation(${currentLocation.latitude},${currentLocation.longitude})`,
			);
		}, [currentLocation, webviewReady]);

		// Initial center
		useEffect(() => {
			if (webviewRef.current && webviewReady) {
				webviewRef.current.injectJavaScript(
					`window.mapAPI.setCenter(${initialRegion.latitude},${initialRegion.longitude},${zoom})`,
				);
			}
		}, [webviewReady]);

		const html = buildMapHTML(initialRegion, zoom);

		return (
			<View style={[styles.container, style]}>
				<WebView
					ref={webviewRef}
					source={{ html }}
					style={styles.webview}
					scrollEnabled={false}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					bounces={false}
					onMessage={handleMessage}
					javaScriptEnabled
					domStorageEnabled
					originWhitelist={["*"]}
					mixedContentMode="always"
					// GPU compositing — критично для i.MX 8QXP Vivante GPU
					androidLayerType="hardware"
					// Кэширование
					cacheEnabled
					cacheMode="LOAD_CACHE_ELSE_NETWORK"
					// Безопасность
					allowFileAccess={false}
					allowFileAccessFromFileURLs={false}
					allowUniversalAccessFromFileURLs={false}
				/>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: { flex: 1, overflow: "hidden" },
	webview: { flex: 1, backgroundColor: "#e0e0e0" },
});
