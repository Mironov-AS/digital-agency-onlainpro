import { apiFetch } from "../api.js";
import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Loader2,
	Check,
	Package,
	CreditCard,
	RefreshCw,
	Users,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { generatePaymentDates } from "../utils/date.js";
import ServiceFormModal from "./client-detail/ServiceFormModal.jsx";
import PaymentFormModal from "./client-detail/PaymentFormModal.jsx";
import {
	AddProductModal,
	EditProductModal,
} from "./client-detail/ProductModals.jsx";
import UserFormModal from "./client-detail/UserFormModal.jsx";
import {
	ServicesSection,
	PaymentsSection,
	ClientProductsSection,
	ClientUsersSection,
} from "./client-detail/sections.jsx";

const API_BASE = "/api/clients";
const API_CATALOG = "/api/catalog/services";

function sortPaymentsByDate(payments = []) {
	return [...payments].sort(
		(a, b) => new Date(a.planned_date) - new Date(b.planned_date),
	);
}

export default function ClientDetailPage({ clientId, onBack }) {
	const [client, setClient] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [section, setSection] = useState("services");
	const [modal, setModal] = useState(null);
	const [catalogServices, setCatalogServices] = useState([]);
	const [products, setProducts] = useState([]);
	const [clientSubscriptions, setClientSubscriptions] = useState([]);
	const [clientUsers, setClientUsers] = useState([]);

	useEffect(() => {
		apiFetch(API_CATALOG)
			.then(setCatalogServices)
			.catch(() => {});
		apiFetch("/api/product-shelf/products")
			.then(setProducts)
			.catch(() => {});
		apiFetch("/api/product-shelf/subscriptions")
			.then((subs) => {
				setClientSubscriptions(
					(subs || []).filter((s) => s.client_id === clientId),
				);
			})
			.catch(() => {});
	}, [clientId]);

	async function loadClient() {
		setLoading(true);
		setError("");
		try {
			const data = await apiFetch(`${API_BASE}/${clientId}`);
			setClient(data);
		} catch (err) {
			setError(err.error || "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadClient();
	}, [clientId]);

	async function handleAddService(svcData) {
		const {
			create_schedule,
			schedule_start,
			schedule_end,
			costs = [],
			...serviceData
		} = svcData;
		setModal((m) => ({ ...m, loading: true }));
		try {
			const created = await apiFetch(`${API_BASE}/${clientId}/services`, {
				method: "POST",
				body: JSON.stringify(serviceData),
			});

			for (const cost of costs) {
				try {
					await apiFetch(
						`${API_BASE}/${clientId}/services/${created.id}/costs`,
						{
							method: "POST",
							body: JSON.stringify({
								cost_name: cost.cost_name,
								amount: parseFloat(cost.amount) || 0,
								period: cost.period || "monthly",
								note: cost.note || "",
							}),
						},
					);
				} catch {}
			}

			const newPayments = [];
			if (
				create_schedule &&
				schedule_start &&
				schedule_end &&
				serviceData.payment_interval !== "once"
			) {
				const dates = generatePaymentDates(
					schedule_start,
					schedule_end,
					serviceData.payment_interval,
				);
				for (const date of dates) {
					try {
						const payment = await apiFetch(`${API_BASE}/${clientId}/payments`, {
							method: "POST",
							body: JSON.stringify({
								amount: parseFloat(serviceData.price),
								planned_date: date,
								client_service_id: created.id,
								note: created.service_name,
							}),
						});
						newPayments.push(payment);
					} catch {}
				}
			}

			setClient((c) => ({
				...c,
				services: [...(c.services || []), { ...created, costs }],
				payments: sortPaymentsByDate([...(c.payments || []), ...newPayments]),
			}));
			setModal(null);
			if (newPayments.length > 0) setSection("payments");
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleUpdateService(serviceId, updates) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			const serviceFields = { ...updates };
			delete serviceFields.costs;
			await apiFetch(`${API_BASE}/${clientId}/services/${serviceId}`, {
				method: "PUT",
				body: JSON.stringify(serviceFields),
			});

			const originalCosts =
				client.services.find((s) => s.id === serviceId)?.costs || [];
			const newCostsList = updates.costs || [];
			const existingCosts = newCostsList.filter((c) => c.id);
			const costsToCreate = newCostsList.filter((c) => !c.id);
			const originalCostIds = new Set(originalCosts.map((c) => c.id));
			const newCostIds = new Set(existingCosts.map((c) => c.id));

			for (const costId of originalCostIds) {
				if (!newCostIds.has(costId)) {
					try {
						await apiFetch(
							`${API_BASE}/${clientId}/services/${serviceId}/costs/${costId}`,
							{ method: "DELETE" },
						);
					} catch {}
				}
			}
			for (const cost of existingCosts) {
				const original = originalCosts.find((c) => c.id === cost.id);
				if (
					!original ||
					(original.cost_name === cost.cost_name &&
						original.amount === cost.amount &&
						original.period === cost.period)
				)
					continue;
				try {
					await apiFetch(
						`${API_BASE}/${clientId}/services/${serviceId}/costs/${cost.id}`,
						{
							method: "PUT",
							body: JSON.stringify({
								cost_name: cost.cost_name,
								amount: parseFloat(cost.amount) || 0,
								period: cost.period,
								note: cost.note || "",
							}),
						},
					);
				} catch {}
			}
			for (const cost of costsToCreate) {
				try {
					await apiFetch(
						`${API_BASE}/${clientId}/services/${serviceId}/costs`,
						{
							method: "POST",
							body: JSON.stringify({
								cost_name: cost.cost_name,
								amount: parseFloat(cost.amount) || 0,
								period: cost.period,
								note: cost.note || "",
							}),
						},
					);
				} catch {}
			}

			const updatedClient = await apiFetch(`${API_BASE}/${clientId}`);
			setClient(updatedClient);
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleDeleteService(serviceId) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			await apiFetch(`${API_BASE}/${clientId}/services/${serviceId}`, {
				method: "DELETE",
			});
			setClient((c) => ({
				...c,
				services: c.services.filter((s) => s.id !== serviceId),
			}));
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleToggleStop(service) {
		const fn = service.is_active
			? apiFetch(`${API_BASE}/${clientId}/services/${service.id}/stop`, {
					method: "PATCH",
				})
			: apiFetch(`${API_BASE}/${clientId}/services/${service.id}/resume`, {
					method: "PATCH",
				});
		try {
			const updated = await fn;
			setClient((c) => ({
				...c,
				services: c.services.map((s) => (s.id === service.id ? updated : s)),
			}));
		} catch {}
	}

	async function handleToggleComplete(service) {
		try {
			const updated = await apiFetch(
				`${API_BASE}/${clientId}/services/${service.id}/complete`,
				{ method: "PATCH" },
			);
			setClient((c) => ({
				...c,
				services: c.services.map((s) => (s.id === service.id ? updated : s)),
			}));
		} catch {}
	}

	async function handleAddPayment(paymentData) {
		const {
			create_schedule,
			schedule_start,
			schedule_end,
			payment_interval,
			...singlePayment
		} = paymentData;
		setModal((m) => ({ ...m, loading: true }));
		try {
			const createdPayments = [];
			const dates =
				create_schedule && schedule_start && schedule_end
					? generatePaymentDates(schedule_start, schedule_end, payment_interval)
					: [];

			if (dates.length > 0) {
				for (const date of dates) {
					const created = await apiFetch(`${API_BASE}/${clientId}/payments`, {
						method: "POST",
						body: JSON.stringify({ ...singlePayment, planned_date: date }),
					});
					createdPayments.push(created);
				}
			} else {
				const created = await apiFetch(`${API_BASE}/${clientId}/payments`, {
					method: "POST",
					body: JSON.stringify(singlePayment),
				});
				createdPayments.push(created);
			}

			setClient((c) => ({
				...c,
				payments: sortPaymentsByDate([
					...(c.payments || []),
					...createdPayments,
				]),
			}));
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleUpdatePayment(paymentId, paymentData) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			const updated = await apiFetch(
				`${API_BASE}/${clientId}/payments/${paymentId}`,
				{
					method: "PUT",
					body: JSON.stringify(paymentData),
				},
			);
			setClient((c) => ({
				...c,
				payments: sortPaymentsByDate(
					c.payments.map((p) => (p.id === paymentId ? updated : p)),
				),
			}));
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleDeletePayment(paymentId) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			await apiFetch(`${API_BASE}/${clientId}/payments/${paymentId}`, {
				method: "DELETE",
			});
			setClient((c) => ({
				...c,
				payments: c.payments.filter((p) => p.id !== paymentId),
			}));
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleMarkPaid(payment, paidDate) {
		try {
			const updated = await apiFetch(
				`${API_BASE}/${clientId}/payments/${payment.id}/pay`,
				{
					method: "PATCH",
					body: JSON.stringify({ paid_date: paidDate }),
				},
			);
			setClient((c) => ({
				...c,
				payments: c.payments.map((p) => (p.id === payment.id ? updated : p)),
			}));
		} catch {}
	}

	async function handleAddProductSubscription(formData) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			const {
				create_schedule,
				schedule_start,
				schedule_end,
				...subscriptionData
			} = formData;
			const sub = await apiFetch("/api/product-shelf/subscriptions", {
				method: "POST",
				body: JSON.stringify({ ...subscriptionData, client_id: clientId }),
			});

			const newPayments = [];
			if (
				create_schedule &&
				schedule_start &&
				schedule_end &&
				subscriptionData.billing_period !== "once"
			) {
				const dates = generatePaymentDates(
					schedule_start,
					schedule_end,
					subscriptionData.billing_period,
				);
				for (const date of dates) {
					try {
						const payment = await apiFetch(`${API_BASE}/${clientId}/payments`, {
							method: "POST",
							body: JSON.stringify({
								amount: parseFloat(subscriptionData.billing_amount),
								planned_date: date,
								client_product_subscription_id: sub.id,
								note: subscriptionData.product_code,
							}),
						});
						newPayments.push(payment);
					} catch {}
				}
			}

			const subs = await apiFetch("/api/product-shelf/subscriptions");
			setClientSubscriptions(
				(subs || []).filter((s) => s.client_id === clientId),
			);
			if (newPayments.length > 0) {
				setClient((c) => ({
					...c,
					payments: sortPaymentsByDate([...(c.payments || []), ...newPayments]),
				}));
				setSection("payments");
			}
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleEditProductSubscription(id, formData) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			await apiFetch(`/api/product-shelf/subscriptions/${id}`, {
				method: "PATCH",
				body: JSON.stringify(formData),
			});
			const subs = await apiFetch("/api/product-shelf/subscriptions");
			setClientSubscriptions(
				(subs || []).filter((s) => s.client_id === clientId),
			);
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function handleDeleteProductSubscription(id) {
		setModal((m) => ({ ...m, loading: true }));
		try {
			await apiFetch(`/api/product-shelf/subscriptions/${id}`, {
				method: "DELETE",
			});
			setClientSubscriptions((subs) => subs.filter((s) => s.id !== id));
			setModal(null);
		} catch (err) {
			setModal((m) => ({
				...m,
				loading: false,
				serverError: err.error || "Ошибка",
			}));
		}
	}

	async function loadClientUsers() {
		try {
			const users = await apiFetch("/api/auth/users");
			setClientUsers((users || []).filter((u) => u.client_id === clientId));
		} catch {}
	}

	useEffect(() => {
		loadClientUsers();
	}, [clientId]);

	async function handleToggleSubscriptionStatus(sub) {
		try {
			const nextStatus = sub.status === "active" ? "inactive" : "active";
			await apiFetch(`/api/product-shelf/subscriptions/${sub.id}`, {
				method: "PATCH",
				body: JSON.stringify({ status: nextStatus }),
			});
			const subs = await apiFetch("/api/product-shelf/subscriptions");
			setClientSubscriptions(
				(subs || []).filter((s) => s.client_id === clientId),
			);
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	}

	if (loading)
		return (
			<div className="loading-center">
				<Loader2 size={28} className="spin" />
			</div>
		);
	if (error)
		return (
			<div className="page-error">
				{error} <button onClick={loadClient}>Повторить</button>
			</div>
		);
	if (!client) return null;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const isPaymentOverdue = (p) => {
		if (p.status === "overdue") return true;
		if (p.status !== "pending") return false;
		const planned = new Date(p.planned_date);
		planned.setHours(0, 0, 0, 0);
		return planned < today;
	};
	const pending = (client.payments || []).filter(
		(p) => p.status === "pending" && !isPaymentOverdue(p),
	);
	const overdue = (client.payments || []).filter(isPaymentOverdue);
	const unpaidCount = pending.length + overdue.length;

	async function handleActivateClient() {
		try {
			await apiFetch(`${API_BASE}/${clientId}`, {
				method: "PUT",
				body: JSON.stringify({ status: "active" }),
			});
			setClient((c) => ({ ...c, status: "active" }));
		} catch {}
	}

	return (
		<div className="page">
			<div className="page-header">
				<button className="btn-back" onClick={onBack}>
					<ArrowLeft size={16} /> Назад
				</button>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
						<h1 className="page-title">{client.name}</h1>
						{client.status === "testing" && (
							<span
								style={{
									fontSize: 12,
									fontWeight: 700,
									padding: "3px 10px",
									borderRadius: 6,
									background: "#fef3c7",
									color: "#b45309",
									border: "1px solid #fde68a",
								}}
							>
								Тестирование
							</span>
						)}
					</div>
					{client.email && <p className="page-sub">{client.email}</p>}
					{client.status === "testing" && (
						<button
							onClick={handleActivateClient}
							style={{
								marginTop: 6,
								fontSize: 12,
								fontWeight: 600,
								padding: "4px 12px",
								borderRadius: 6,
								border: "1px solid #bbf7d0",
								background: "#dcfce7",
								color: "#16a34a",
								cursor: "pointer",
							}}
						>
							<Check
								size={12}
								style={{ marginRight: 4, verticalAlign: "middle" }}
							/>{" "}
							Активировать клиента
						</button>
					)}
				</div>
				<div className="section-tabs">
					<button
						className={`section-tab ${section === "services" ? "active" : ""}`}
						onClick={() => setSection("services")}
					>
						<Package size={14} /> Услуги
					</button>
					<button
						className={`section-tab ${section === "payments" ? "active" : ""}`}
						onClick={() => setSection("payments")}
					>
						<CreditCard size={14} /> Платежи{" "}
						{unpaidCount > 0 && (
							<span
								className={`badge-count${overdue.length > 0 ? " badge-count--danger" : ""}`}
							>
								{unpaidCount}
							</span>
						)}
					</button>
					<button
						className={`section-tab ${section === "products" ? "active" : ""}`}
						onClick={() => setSection("products")}
					>
						<RefreshCw size={14} /> Продукты
					</button>
					<button
						className={`section-tab ${section === "users" ? "active" : ""}`}
						onClick={() => setSection("users")}
					>
						<Users size={14} /> Пользователи
					</button>
				</div>
			</div>

			{section === "services" && (
				<ServicesSection
					client={client}
					modal={modal}
					setModal={setModal}
					catalogServices={catalogServices}
					onAddService={handleAddService}
					onUpdateService={handleUpdateService}
					onDeleteService={handleDeleteService}
					onToggleStop={handleToggleStop}
					onToggleComplete={handleToggleComplete}
				/>
			)}

			{section === "payments" && (
				<PaymentsSection
					client={client}
					modal={modal}
					setModal={setModal}
					onAddPayment={handleAddPayment}
					onUpdatePayment={handleUpdatePayment}
					onDeletePayment={handleDeletePayment}
					onMarkPaid={handleMarkPaid}
					subscriptions={clientSubscriptions}
				/>
			)}

			{section === "products" && (
				<ClientProductsSection
					subscriptions={clientSubscriptions}
					products={products}
					modal={modal}
					setModal={setModal}
					onAddSubscription={handleAddProductSubscription}
					onDeleteSubscription={handleDeleteProductSubscription}
					onToggleStatus={handleToggleSubscriptionStatus}
					onEditSubscription={(sub) =>
						setModal({ mode: "editProduct", target: sub })
					}
				/>
			)}

			{section === "users" && (
				<ClientUsersSection users={clientUsers} setModal={setModal} />
			)}

			{modal?.mode === "addService" && (
				<ServiceFormModal
					catalogServices={catalogServices}
					onClose={() => setModal(null)}
					onSave={handleAddService}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "editService" && (
				<ServiceFormModal
					catalogServices={catalogServices}
					service={modal.target}
					onClose={() => setModal(null)}
					onSave={(data) => handleUpdateService(modal.target.id, data)}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "deleteService" && (
				<ConfirmModal
					title="Удалить услугу"
					message={`Удалить услугу «${modal.target?.service_name}» у клиента?`}
					onConfirm={() => handleDeleteService(modal.target.id)}
					onCancel={() => setModal(null)}
					loading={modal.loading}
					danger
				/>
			)}
			{modal?.mode === "addPayment" && (
				<PaymentFormModal
					services={client.services}
					subscriptions={clientSubscriptions}
					onClose={() => setModal(null)}
					onSave={handleAddPayment}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "editPayment" && (
				<PaymentFormModal
					services={client.services}
					subscriptions={clientSubscriptions}
					payment={modal.target}
					onClose={() => setModal(null)}
					onSave={(d) => handleUpdatePayment(modal.target.id, d)}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "deletePayment" && (
				<ConfirmModal
					title="Удалить платёж"
					message={`Удалить платёж ${modal.target?.amount?.toLocaleString("ru-RU")} ₽?`}
					onConfirm={() => handleDeletePayment(modal.target.id)}
					onCancel={() => setModal(null)}
					loading={modal.loading}
					danger
				/>
			)}
			{modal?.mode === "addProduct" && (
				<AddProductModal
					products={products}
					existingSubscriptions={clientSubscriptions}
					onClose={() => setModal(null)}
					onSave={handleAddProductSubscription}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "editProduct" && (
				<EditProductModal
					subscription={modal.target}
					products={products}
					onClose={() => setModal(null)}
					onSave={(formData) =>
						handleEditProductSubscription(modal.target.id, formData)
					}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "deleteProduct" && (
				<ConfirmModal
					title="Удалить продукт"
					message={`Отключить продукт «${modal.target?.product_name}» у клиента?`}
					onConfirm={() => handleDeleteProductSubscription(modal.target.id)}
					onCancel={() => setModal(null)}
					loading={modal.loading}
					danger
				/>
			)}
			{modal?.mode === "addUser" && (
				<UserFormModal
					clientId={clientId}
					onClose={() => setModal(null)}
					onSave={() => {
						setModal(null);
						loadClientUsers();
					}}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "editUser" && (
				<UserFormModal
					clientId={clientId}
					user={modal.target}
					onClose={() => setModal(null)}
					onSave={() => {
						setModal(null);
						loadClientUsers();
					}}
					loading={modal.loading}
					serverError={modal.serverError}
				/>
			)}
			{modal?.mode === "deleteUser" && (
				<ConfirmModal
					title="Удалить пользователя"
					message={`Удалить пользователя «${modal.target?.name}» (${modal.target?.email})?`}
					onConfirm={async () => {
						setModal((m) => ({ ...m, loading: true }));
						try {
							await apiFetch(`/api/auth/users/${modal.target.id}`, {
								method: "DELETE",
							});
							loadClientUsers();
							setModal(null);
						} catch (e) {
							setModal((m) => ({
								...m,
								loading: false,
								serverError: e.error || "Ошибка",
							}));
						}
					}}
					onCancel={() => setModal(null)}
					loading={modal.loading}
					danger
				/>
			)}
		</div>
	);
}
