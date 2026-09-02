let refreshing = null;

export async function apiFetch(path, opts = {}) {
	const res = await fetch(path, {
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		...opts,
	});

	if (res.status === 401) {
		if (!refreshing) {
			refreshing = fetch("/api/auth/refresh", {
				method: "POST",
				credentials: "include",
			}).finally(() => {
				refreshing = null;
			});
		}
		const refreshRes = await refreshing;
		if (!refreshRes.ok) {
			throw { error: "Unauthorized", status: 401 };
		}
		const retry = await fetch(path, {
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			...opts,
		});
		if (!retry.ok)
			throw await retry.json().catch(() => ({ error: retry.statusText }));
		return retry.json();
	}

	if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
	return res.json();
}

export async function apiFetchBlob(path, opts = {}) {
	const res = await fetch(path, {
		credentials: "include",
		...opts,
	});
	if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }));
	return res.blob();
}

// Returns auth headers (for FormData uploads that can't carry credentials)
export function authHeaders() {
	return { Authorization: "Bearer dummy" }; // queue-service reads cookie, this header is ignored
}
