import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
	ClientProductsSection,
	ClientUsersSection,
	ServicesSection,
} from "./sections.jsx";

describe("Client detail section actions", () => {
	it("opens add service modal from services toolbar", () => {
		const setModal = vi.fn();

		render(
			<ServicesSection
				client={{ contact_person: "", services: [] }}
				modal={null}
				setModal={setModal}
				catalogServices={[]}
				onAddService={vi.fn()}
				onUpdateService={vi.fn()}
				onDeleteService={vi.fn()}
				onToggleStop={vi.fn()}
				onToggleComplete={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /добавить услугу/i }));

		expect(setModal).toHaveBeenCalledWith({ mode: "addService" });
	});

	it("opens add product modal from products toolbar", () => {
		const setModal = vi.fn();

		render(
			<ClientProductsSection
				subscriptions={[]}
				products={[]}
				modal={null}
				setModal={setModal}
				onAddSubscription={vi.fn()}
				onDeleteSubscription={vi.fn()}
				onToggleStatus={vi.fn()}
				onEditSubscription={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /добавить продукт/i }));

		expect(setModal).toHaveBeenCalledWith({ mode: "addProduct" });
	});

	it("opens add user modal from users toolbar", () => {
		const setModal = vi.fn();

		render(<ClientUsersSection users={[]} setModal={setModal} />);

		fireEvent.click(
			screen.getByRole("button", { name: /добавить пользователя/i }),
		);

		expect(setModal).toHaveBeenCalledWith({ mode: "addUser" });
	});
});
