const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";

function emptyStatus(clientIds) {
	return Object.fromEntries(
		[...new Set((clientIds || []).filter(Boolean))].map((id) => [
			id,
			{ is_online: false, online_count: 0, total_users: 0, online_users: [] },
		]),
	);
}

async function fetchClientsOnlineStatus(clientIds, authHeader) {
	const uniqueClientIds = [...new Set((clientIds || []).filter(Boolean))];
	const fallback = emptyStatus(uniqueClientIds);
	if (!uniqueClientIds.length || !authHeader) return fallback;

	try {
		const params = new URLSearchParams({
			client_ids: uniqueClientIds.join(","),
		});
		const response = await fetch(
			`${AUTH_URL}/api/auth/clients/online-status?${params.toString()}`,
			{ headers: { Authorization: authHeader } },
		);
		if (!response.ok) return fallback;

		const data = await response.json();
		const statuses = data.statuses || {};
		return Object.fromEntries(
			uniqueClientIds.map((id) => {
				const status = statuses[id] || fallback[id];
				return [
					id,
					{
						is_online: Boolean(status.is_online),
						online_count: Number(status.online_count) || 0,
						total_users: Number(status.total_users) || 0,
						online_users: (status.users || []).filter((user) => user.is_online),
					},
				];
			}),
		);
	} catch (err) {
		console.warn(
			"[clients-service] Failed to load online statuses:",
			err.message,
		);
		return fallback;
	}
}

function applyClientOnlineStatus(client, onlineStatus) {
	const status = onlineStatus?.[client.id] || {};
	client.is_online = Boolean(status.is_online);
	client.online_count = Number(status.online_count) || 0;
	client.total_users = Number(status.total_users) || 0;
	client.online_users = Array.isArray(status.online_users)
		? status.online_users
		: [];
	return client;
}

module.exports = {
	fetchClientsOnlineStatus,
	applyClientOnlineStatus,
};
