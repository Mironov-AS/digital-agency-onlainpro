import { useEffect } from "react";

/**
 * Универсальный SEO hook для всех страниц лендинга
 * @param {Object} options - SEO параметры
 * @param {string} options.title - Title страницы
 * @param {string} options.description - Meta description
 * @param {string} options.keywords - Ключевые слова через запятую
 * @param {string} options.canonical - Канонильный URL
 * @param {string} options.geoRegion - GEO регион (RU-MOW, RU-SPE, RU)
 * @param {string} options.geoPlacename - GEO местоположение
 * @param {Object} options.schema - Schema.org данные
 * @param {Array} options.faq - FAQ для Schema FAQPage
 * @param {string} options.pageName - Название страницы для логов
 */
export function useSEO({
	title,
	description,
	keywords,
	canonical,
	geoRegion = "RU",
	geoPlacename = "Россия",
	schema,
	faq = [],
	pageName = "",
}) {
	useEffect(() => {
		// Устанавливаем title
		if (title) {
			document.title = title;
		}

		// Meta description
		let metaDesc = document.querySelector('meta[name="description"]');
		if (!metaDesc) {
			metaDesc = document.createElement("meta");
			metaDesc.name = "description";
			document.head.appendChild(metaDesc);
		}
		metaDesc.content = description || "";

		// Meta keywords
		if (keywords) {
			let metaKeywords = document.querySelector('meta[name="keywords"]');
			if (!metaKeywords) {
				metaKeywords = document.createElement("meta");
				metaKeywords.name = "keywords";
				document.head.appendChild(metaKeywords);
			}
			metaKeywords.content = keywords;
		}

		// GEO теги
		let geoRegionMeta = document.querySelector('meta[name="geo.region"]');
		if (!geoRegionMeta) {
			geoRegionMeta = document.createElement("meta");
			geoRegionMeta.name = "geo.region";
			document.head.appendChild(geoRegionMeta);
		}
		geoRegionMeta.content = geoRegion;

		let geoPlacenameMeta = document.querySelector('meta[name="geo.placename"]');
		if (!geoPlacenameMeta) {
			geoPlacenameMeta = document.createElement("meta");
			geoPlacenameMeta.name = "geo.placename";
			document.head.appendChild(geoPlacenameMeta);
		}
		geoPlacenameMeta.content = geoPlacename;

		// Canonical URL
		if (canonical) {
			let canonicalLink = document.querySelector('link[rel="canonical"]');
			if (!canonicalLink) {
				canonicalLink = document.createElement("link");
				canonicalLink.rel = "canonical";
				document.head.appendChild(canonicalLink);
			}
			canonicalLink.href = canonical;
		}

		// OG теги
		if (title) {
			let ogTitle = document.querySelector('meta[property="og:title"]');
			if (!ogTitle) {
				ogTitle = document.createElement("meta");
				ogTitle.setAttribute("property", "og:title");
				document.head.appendChild(ogTitle);
			}
			ogTitle.content = title;
		}

		if (description) {
			let ogDesc = document.querySelector('meta[property="og:description"]');
			if (!ogDesc) {
				ogDesc = document.createElement("meta");
				ogDesc.setAttribute("property", "og:description");
				document.head.appendChild(ogDesc);
			}
			ogDesc.content = description;
		}

		let ogType = document.querySelector('meta[property="og:type"]');
		if (!ogType) {
			ogType = document.createElement("meta");
			ogType.setAttribute("property", "og:type");
			document.head.appendChild(ogType);
		}
		ogType.content = "website";

		let ogLocale = document.querySelector('meta[property="og:locale"]');
		if (!ogLocale) {
			ogLocale = document.createElement("meta");
			ogLocale.setAttribute("property", "og:locale");
			document.head.appendChild(ogLocale);
		}
		ogLocale.content = "ru_RU";

		let ogSiteName = document.querySelector('meta[property="og:site_name"]');
		if (!ogSiteName) {
			ogSiteName = document.createElement("meta");
			ogSiteName.setAttribute("property", "og:site_name");
			document.head.appendChild(ogSiteName);
		}
		ogSiteName.content = "ОнлайнПро.РФ";

		// Schema.org
		if (schema) {
			let schemaScript = document.getElementById("page-schema");
			if (!schemaScript) {
				schemaScript = document.createElement("script");
				schemaScript.id = "page-schema";
				schemaScript.type = "application/ld+json";
				document.head.appendChild(schemaScript);
			}
			schemaScript.textContent = JSON.stringify({
				"@context": "https://schema.org",
				...schema,
			});
		}

		// FAQ Schema
		if (faq && faq.length > 0) {
			let faqScript = document.getElementById("faq-schema");
			if (!faqScript) {
				faqScript = document.createElement("script");
				faqScript.id = "faq-schema";
				faqScript.type = "application/ld+json";
				document.head.appendChild(faqScript);
			}
			faqScript.textContent = JSON.stringify({
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: faq.map((item) => ({
					"@type": "Question",
					name: item.question,
					acceptedAnswer: {
						"@type": "Answer",
						text: item.answer,
					},
				})),
			});
		}

		// Cleanup function
		return () => {
			document.title =
				"Цифровое агентство ОнлайнПро.РФ — разработка сайтов, MVP, автоматизация бизнеса";

			const idsToRemove = ["page-schema", "faq-schema"];
			idsToRemove.forEach((id) => {
				const el = document.getElementById(id);
				if (el) el.remove();
			});
		};
	}, [
		title,
		description,
		keywords,
		canonical,
		geoRegion,
		geoPlacename,
		schema,
		faq,
		pageName,
	]);
}

export default useSEO;
