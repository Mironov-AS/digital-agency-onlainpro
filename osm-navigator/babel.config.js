/**
 * Babel config — оптимизация для i.MX 8QXP (Cortex-A35)
 *
 * Только lazy imports — никаких агрессивных оптимизаций,
 * которые могут сломать runtime поведение сетевых вызовов.
 */
module.exports = (api) => {
	api.cache(true);

	return {
		presets: [
			[
				"babel-preset-expo",
				{
					// Lazy imports — критично для i.MX 8QXP RAM (2-4GB)
					lazyImports: true,
				},
			],
		],
	};
};
