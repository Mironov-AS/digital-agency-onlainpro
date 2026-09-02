// ─── Constants & helpers shared across Electronic Queue tabs ───────────────

export const STATUS_LABELS = {
	waiting: "Ожидает",
	called: "Вызван",
	served: "Обслужен",
};

export const STATUS_COLORS = {
	waiting: { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" },
	called: { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
	served: { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
};

export const ROLE_LABELS = {
	admin: "Администратор",
	operator: "Оператор",
	advertiser: "Рекламодатель",
};

export const ROLE_COLORS = {
	admin: { bg: "#f5f3ff", color: "#6d28d9", border: "#c4b5fd" },
	operator: { bg: "#eff6ff", color: "#1e40af", border: "#93c5fd" },
	advertiser: { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
};

export const ACTION_LABELS = {
	"user.login": "Вход в систему",
	"ticket.called": "Талон вызван",
	"ticket.called.repeat": "Повтор вызова",
	"ticket.returned": "Возврат в очередь",
	"ticket.transferred": "Перевод талона",
	"ticket.manual": "Ручная регистрация",
	"ticket.served": "Талон обслужен",
	"service.created": "Услуга создана",
	"service.updated": "Услуга изменена",
	"service.deleted": "Услуга удалена",
	"service.enabled": "Услуга включена",
	"service.disabled": "Услуга отключена",
	"service.set_default": "Услуга по умолчанию",
	"service.unset_default": "Снят флаг по умолчанию",
	"queue.reset": "Очередь сброшена",
	"queue.return_all": "Все талоны возвращены в очередь",
	"settings.password_changed": "Пароль изменён",
	"settings.registration": "Настройка записи",
	"settings.auto_open": "Автооткрытие",
	"settings.auto_reset": "Автосброс",
	"settings.ads": "Настройки рекламы",
	"settings.field_min_length": "Мин. длина поля",
	"settings.terminal_countdown": "Таймер терминала",
	"user.created": "Пользователь создан",
	"user.deleted": "Пользователь удалён",
	"user.password_reset": "Сброс пароля",
};

export const FIELD_TYPES = [
	{ value: "text", label: "Текст" },
	{ value: "phone", label: "Телефон" },
	{ value: "number", label: "Число" },
	{ value: "date", label: "Дата" },
	{ value: "email", label: "Email" },
	{ value: "textarea", label: "Длинный текст" },
];

export const FIELD_INPUT_TYPES_ADMIN = {
	text: "text",
	phone: "tel",
	number: "number",
	date: "date",
	email: "email",
	textarea: "text",
};

// ─── Date / time helpers ──────────────────────────────────────────────────

export function todayStr() {
	return new Date().toISOString().split("T")[0];
}

export function fmtDate(d) {
	if (!d) return "—";
	return new Date(d + "T00:00:00").toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export function fmtDateTime(dt) {
	if (!dt) return "—";
	return new Date(dt).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function fmtTime(dt) {
	if (!dt) return "—";
	return new Date(dt).toLocaleTimeString("ru-RU", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function nowTime() {
	return new Date().toLocaleTimeString("ru-RU", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}
