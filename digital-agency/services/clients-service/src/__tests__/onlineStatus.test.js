const { applyClientOnlineStatus } = require("../services/onlineStatus");

describe("onlineStatus service", () => {
	it("applies auth-service online status correctly", () => {
		const client = { id: "client-1" };

		applyClientOnlineStatus(client, {
			"client-1": {
				is_online: true,
				online_count: 2,
				total_users: 5,
				online_users: [{ id: "u1", is_online: true }],
			},
		});

		expect(client.is_online).toBe(true);
		expect(client.online_count).toBe(2);
		expect(client.total_users).toBe(5);
		expect(client.online_users).toEqual([{ id: "u1", is_online: true }]);
	});

	it("applies auth-service offline status correctly", () => {
		const client = {
			id: "client-1",
			last_user_activity: new Date().toISOString(),
		};

		applyClientOnlineStatus(client, {
			"client-1": {
				is_online: false,
				online_count: 0,
				total_users: 0,
				online_users: [],
			},
		});

		expect(client.is_online).toBe(false);
		expect(client.online_count).toBe(0);
		expect(client.total_users).toBe(0);
		expect(client.online_users).toEqual([]);
	});

	it("falls back to empty status when client is missing from response", () => {
		const client = { id: "client-1" };

		applyClientOnlineStatus(client, {});

		expect(client.is_online).toBe(false);
		expect(client.online_count).toBe(0);
		expect(client.total_users).toBe(0);
		expect(client.online_users).toEqual([]);
	});
});
