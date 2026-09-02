/**
 * Expo Config Plugin: withOSMNavCarProjection
 *
 * Добавляет Android Auto CarAppService и проекцию навигации
 * в сгенерированный Android-проект.
 *
 * Для работы нужно:
 * 1. npx expo prebuild — сгенерировать android-директорию
 * 2. Скопировать native файлы из android/app/src/main/java/
 * 3. Скопировать automotive_app_desc.xml в res/xml/
 * 4. Обновить AndroidManifest.xml и build.gradle
 *
 * Автоматическая активация: добавить в app.json → plugins
 */
const {
	withAndroidManifest,
	withAppBuildGradle,
} = require("@expo/prebuild-config");

/** @type {import('@expo/config-plugins').ConfigPlugin} */
module.exports = function withOSMNavCarProjection(config) {
	// 1. Добавляем Android Auto meta-data и CarAppService в манифест
	config = withAndroidManifest(config, async (config) => {
		const manifest = config.modResults;
		const application = manifest.manifest.application?.[0];
		if (!application) return config;

		// Добавляем meta-data для Android Auto
		if (!application["meta-data"]) application["meta-data"] = [];

		application["meta-data"].push({
			$: {
				name: "com.google.android.gms.car.application",
				"android:resource": "@xml/automotive_app_desc",
			},
		});

		application["meta-data"].push({
			$: {
				name: "androidx.car.app.minCarApiLevel",
				"android:value": "2",
			},
		});

		// Регистрируем CarAppService
		if (!application.service) application.service = [];
		application.service.push({
			$: {
				name: "com.osmnavigator.carprojection.OSMNavCarAppService",
				"android:exported": "true",
			},
			"intent-filter": [
				{
					action: [{ $: { name: "androidx.car.app.CarAppService" } }],
					category: [
						{ $: { name: "androidx.car.app.category.POINAVIGATION" } },
					],
				},
			],
		});

		return config;
	});

	// 2. Добавляем CarAppLibrary dependency
	config = withAppBuildGradle(config, (config) => {
		const content = config.modResults.contents;
		// Добавляем dependency если её ещё нет
		if (!content.includes("androidx.car.app")) {
			const insertAfter = content.match(
				/dependencies\s*\{[^}]*implementation\s+["']com\.facebook\.react:react-android:[^"']+["']/,
			);
			if (insertAfter) {
				config.modResults.contents =
					content + '\n    implementation "androidx.car.app:app:4.4.0"\n';
			}
		}
		return config;
	});

	return config;
};
