// ═══════════════════════════════════════════════════════════════════════
// Brand Icons — Production Style
// ═══════════════════════════════════════════════════════════════════════

const iconStyle = {
	display: "inline-block",
	verticalAlign: "middle",
};

// IconQueue — Электронная очередь
export const IconQueue = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<defs>
			<linearGradient id="queueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#a855f7" />
				<stop offset="100%" stopColor="#22d3ee" />
			</linearGradient>
		</defs>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="url(#queueGrad)"
			strokeWidth="2"
		/>
		<path
			d="M24 20H40M24 32H40M24 44H36"
			stroke="url(#queueGrad)"
			strokeWidth="3"
			strokeLinecap="round"
		/>
		<circle cx="48" cy="44" r="8" fill="#22d3ee" />
		<text
			x="45"
			y="48"
			fill="#0a0a0f"
			fontSize="10"
			fontWeight="bold"
			textAnchor="middle"
		>
			+
		</text>
	</svg>
);

// IconAnalytics — Аналитика
export const IconAnalytics = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M16 48V32L24 28L32 36L40 24L48 20"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<circle cx="48" cy="20" r="4" fill="#22d3ee" />
	</svg>
);

// IconShield — Безопасность
export const IconShield = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M32 8L12 16V32C12 44 20 52 32 56C44 52 52 44 52 32V16L32 8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M24 32L30 38L42 26"
			stroke="#22d3ee"
			strokeWidth="4"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconRocket — Старт
export const IconRocket = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M32 8C32 8 44 16 44 32C44 40 40 48 32 56C24 48 20 40 20 32C20 16 32 8 32 8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle cx="32" cy="28" r="6" fill="#22d3ee" />
		<path d="M24 48L20 56L28 52L32 60L36 52L44 56L40 48" fill="#22d3ee" />
	</svg>
);

// IconQR — QR-код
export const IconQR = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="20"
			height="20"
			rx="4"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect
			x="36"
			y="8"
			width="20"
			height="20"
			rx="4"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect
			x="8"
			y="36"
			width="20"
			height="20"
			rx="4"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect x="36" y="36" width="8" height="8" rx="2" fill="#a855f7" />
		<rect x="48" y="36" width="8" height="8" rx="2" fill="#a855f7" />
		<rect x="36" y="48" width="8" height="8" rx="2" fill="#a855f7" />
		<rect x="48" y="48" width="8" height="8" rx="2" fill="#a855f7" />
	</svg>
);

// IconChat — Чат
export const IconChat = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M8 16C8 12 12 8 16 8H48C52 8 56 12 56 16V40C56 44 52 48 48 48H20L8 56V16Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle cx="20" cy="24" r="2" fill="#22d3ee" />
		<circle cx="28" cy="24" r="2" fill="#22d3ee" />
		<circle cx="36" cy="24" r="2" fill="#22d3ee" />
		<path
			d="M16 36H40"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

// IconClock — Часы
export const IconClock = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M32 16V32L42 38"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<circle cx="32" cy="32" r="3" fill="#a855f7" />
	</svg>
);

// IconMoney — Деньги
export const IconMoney = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<text
			x="32"
			y="40"
			fill="#22d3ee"
			fontSize="28"
			fontWeight="bold"
			textAnchor="middle"
		>
			₽
		</text>
	</svg>
);

// IconTarget — Цель
export const IconTarget = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(168, 85, 247, 0.1)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle
			cx="32"
			cy="32"
			r="16"
			fill="none"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle
			cx="32"
			cy="32"
			r="8"
			fill="none"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle cx="32" cy="32" r="3" fill="#22d3ee" />
		<path
			d="M48 16L56 8"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
		/>
	</svg>
);

// IconIdea — Идея
export const IconIdea = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M32 8C20 8 12 16 12 28C12 36 16 42 22 46V52C22 54 24 56 26 56H38C40 56 42 54 42 52V46C48 42 52 36 52 28C52 16 44 8 32 8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path d="M26 56V60H38V56" stroke="#a855f7" strokeWidth="2" />
		<path
			d="M24 28H40"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M26 34H38"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M28 40H36"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

// IconStar — Звезда
export const IconStar = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M32 8L38 24H56L42 34L48 52L32 42L16 52L22 34L8 24H26L32 8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinejoin="round"
		/>
		<path
			d="M32 16L36 26H48L38 32L42 44L32 36L22 44L26 32L16 26H28L32 16Z"
			fill="#22d3ee"
		/>
	</svg>
);

// IconChecklist — Чеклист
export const IconChecklist = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="52"
			rx="4"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect x="16" y="20" width="32" height="4" rx="2" fill="#22d3ee" />
		<rect x="16" y="30" width="24" height="4" rx="2" fill="#22d3ee" />
		<rect x="16" y="40" width="28" height="4" rx="2" fill="#22d3ee" />
		<path
			d="M22 24L26 28L34 20"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconUsers — Пользователи
export const IconUsers = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="24"
			cy="20"
			r="10"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M8 52C8 40 14 32 24 32C34 32 40 40 40 52"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<circle
			cx="44"
			cy="24"
			r="8"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M48 48C48 40 46 36 44 36C42 36 40 40 40 48"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

// IconTag — Тег
export const IconTag = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M8 12H24L52 40L40 52L12 24V12H8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinejoin="round"
		/>
		<circle cx="20" cy="20" r="6" fill="#22d3ee" />
	</svg>
);

// IconTrend — Тренд
export const IconTrend = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M16 44L24 32L32 38L44 20L52 28"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M44 20H52V28"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconChart — График
export const IconChart = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect x="16" y="36" width="8" height="16" rx="2" fill="#a855f7" />
		<rect x="28" y="28" width="8" height="24" rx="2" fill="#22d3ee" />
		<rect x="40" y="20" width="8" height="32" rx="2" fill="#a855f7" />
	</svg>
);

// IconBooking — Запись
export const IconBooking = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<rect x="16" y="8" width="32" height="12" rx="4" fill="#a855f7" />
		<path
			d="M24 28H40"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M24 36H34"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M24 44H38"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<circle cx="44" cy="44" r="12" fill="#22d3ee" />
		<path
			d="M44 38V44L48 48"
			stroke="#0a0a0f"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconCheck — Галочка
export const IconCheck = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(34, 197, 94, 0.15)"
			stroke="#22c55e"
			strokeWidth="2"
		/>
		<path
			d="M20 32L28 40L44 24"
			stroke="#22c55e"
			strokeWidth="4"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconPackage — Коробка
export const IconPackage = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M32 8L8 20V44L32 56L56 44V20L32 8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M32 8L8 20L32 32L56 20L32 8Z"
			fill="rgba(168, 85, 247, 0.25)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path d="M32 32V56" stroke="#a855f7" strokeWidth="2" />
		<path d="M8 20L32 32L56 20" stroke="#a855f7" strokeWidth="2" />
	</svg>
);

// IconStore — Магазин
export const IconStore = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M8 24H56L52 56H12L8 24Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M8 24L16 8H48L56 24"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinejoin="round"
		/>
		<rect x="24" y="36" width="16" height="20" rx="2" fill="#22d3ee" />
	</svg>
);

// IconBoxes — Склад
export const IconBoxes = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="24"
			width="24"
			height="24"
			rx="4"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<rect
			x="32"
			y="16"
			width="24"
			height="24"
			rx="4"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect
			x="32"
			y="36"
			width="24"
			height="24"
			rx="4"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
	</svg>
);

// Handshake icon
export const IconHandshake = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M8 32L20 24L32 32L44 24L56 32"
			stroke="#a855f7"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M32 32V44"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
		/>
		<circle cx="16" cy="24" r="6" fill="#a855f7" />
		<circle cx="48" cy="24" r="6" fill="#22d3ee" />
		<path
			d="M24 36L32 44L40 36"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

// IconWebDev — Веб-разработка
export const IconWebDev = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="12"
			width="48"
			height="36"
			rx="4"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path d="M8 20H56" stroke="#a855f7" strokeWidth="2" />
		<circle cx="14" cy="16" r="2" fill="#22d3ee" />
		<circle cx="20" cy="16" r="2" fill="#22c55e" />
		<circle cx="26" cy="16" r="2" fill="#eab308" />
		<path
			d="M16 28H24M16 36H28M16 44H20"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M36 32L40 36L36 40M44 36H28"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconAutomation — Автоматизация
export const IconAutomation = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle
			cx="32"
			cy="32"
			r="10"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M32 8V16M32 48V56M8 32H16M48 32H56"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M14 14L20 20M44 44L50 50M14 50L20 44M44 20L50 14"
			stroke="#22d3ee"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<circle cx="32" cy="32" r="4" fill="#a855f7" />
	</svg>
);

// IconCRM — CRM система
export const IconCRM = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle
			cx="24"
			cy="24"
			r="8"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M12 48C12 38 16 32 24 32"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<rect x="36" y="16" width="16" height="4" rx="2" fill="#22d3ee" />
		<rect x="36" y="26" width="12" height="4" rx="2" fill="#22d3ee" />
		<rect x="36" y="36" width="14" height="4" rx="2" fill="#22d3ee" />
		<rect x="36" y="46" width="10" height="4" rx="2" fill="#22d3ee" />
	</svg>
);

// IconMail — Почта
export const IconMail = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="16"
			width="48"
			height="36"
			rx="4"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M8 20L32 36L56 20"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path d="M8 52V20H56V52" stroke="#a855f7" strokeWidth="2" />
	</svg>
);

// IconERP — ERP система
export const IconERP = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<rect
			x="14"
			y="14"
			width="16"
			height="16"
			rx="2"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect
			x="34"
			y="14"
			width="16"
			height="16"
			rx="2"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect
			x="14"
			y="34"
			width="16"
			height="16"
			rx="2"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect
			x="34"
			y="34"
			width="16"
			height="16"
			rx="2"
			fill="rgba(34, 211, 238, 0.2)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<path
			d="M22 22H22.01M42 22H42.01M22 42H22.01M42 42H42.01"
			stroke="#a855f7"
			strokeWidth="3"
			strokeLinecap="round"
		/>
	</svg>
);

// IconOzon — Ozon интеграция
export const IconOzon = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="8"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<circle
			cx="32"
			cy="24"
			r="10"
			fill="rgba(168, 85, 247, 0.3)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path d="M26 34L32 48L38 34" fill="#22d3ee" />
		<path
			d="M28 34H36"
			stroke="#a855f7"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

// IconBell — Звуковое оповещение
export const IconBell = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path
			d="M32 8C22 8 14 16 14 26V38L10 46H54L50 38V26C50 16 42 8 32 8Z"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M26 46V50C26 52 28 54 32 54C36 54 38 52 38 50V46"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<circle cx="32" cy="24" r="6" fill="#22d3ee" />
		<circle cx="46" cy="14" r="4" fill="#22c55e" />
	</svg>
);

// IconSettings — Настройки
export const IconSettings = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="20"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M32 12V20M32 44V52M12 32H20M44 32H52M17.5 17.5L23 23M41 41L46.5 46.5M46.5 17.5L41 23M23 41L17.5 46.5"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
		/>
		<circle cx="32" cy="32" r="6" fill="#a855f7" />
	</svg>
);

// IconPlay — Воспроизведение / Автоматизация
export const IconPlay = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path d="M26 20L46 32L26 44V20Z" fill="#22d3ee" />
	</svg>
);

// IconList — Список / Журнал
export const IconList = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="8"
			width="48"
			height="48"
			rx="4"
			fill="rgba(34, 211, 238, 0.15)"
			stroke="#22d3ee"
			strokeWidth="2"
		/>
		<rect x="16" y="16" width="8" height="8" rx="2" fill="#a855f7" />
		<rect x="28" y="18" width="24" height="4" rx="2" fill="#22d3ee" />
		<rect x="16" y="28" width="8" height="8" rx="2" fill="#a855f7" />
		<rect x="28" y="30" width="20" height="4" rx="2" fill="#22d3ee" />
		<rect x="16" y="40" width="8" height="8" rx="2" fill="#a855f7" />
		<rect x="28" y="42" width="22" height="4" rx="2" fill="#22d3ee" />
	</svg>
);

// IconDownload — Загрузка / Экспорт
export const IconDownload = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<path d="M32 8V44" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
		<path
			d="M20 32L32 44L44 32"
			stroke="#a855f7"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M8 48V56H56V48"
			stroke="#22d3ee"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// IconCalendar — Календарь / Расписание
export const IconCalendar = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<rect
			x="8"
			y="12"
			width="48"
			height="44"
			rx="4"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<rect x="8" y="12" width="48" height="12" rx="4" fill="#a855f7" />
		<circle cx="20" cy="8" r="4" fill="#22d3ee" />
		<circle cx="44" cy="8" r="4" fill="#22d3ee" />
		<rect x="16" y="30" width="8" height="8" rx="2" fill="#22d3ee" />
		<rect x="28" y="30" width="8" height="8" rx="2" fill="#22d3ee" />
		<rect x="40" y="30" width="8" height="8" rx="2" fill="#22d3ee" />
		<rect x="16" y="42" width="8" height="8" rx="2" fill="#22d3ee" />
		<rect x="28" y="42" width="8" height="8" rx="2" fill="#22d3ee" />
	</svg>
);

// IconAlertCircle — Предупреждение / Дубликаты
export const IconAlertCircle = ({ size = 24, className = "" }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 64 64"
		fill="none"
		style={iconStyle}
		className={className}
	>
		<circle
			cx="32"
			cy="32"
			r="24"
			fill="rgba(168, 85, 247, 0.15)"
			stroke="#a855f7"
			strokeWidth="2"
		/>
		<path
			d="M32 20V36"
			stroke="#22d3ee"
			strokeWidth="4"
			strokeLinecap="round"
		/>
		<circle cx="32" cy="44" r="4" fill="#22d3ee" />
	</svg>
);
