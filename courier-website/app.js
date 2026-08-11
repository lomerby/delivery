let state = {
  users: [],
  couriers: [],
  shipments: []
};

const nigeriaStates = [
  { state: "Abia", capital: "Umuahia" },
  { state: "Adamawa", capital: "Yola" },
  { state: "Akwa Ibom", capital: "Uyo" },
  { state: "Anambra", capital: "Awka" },
  { state: "Bauchi", capital: "Bauchi" },
  { state: "Bayelsa", capital: "Yenagoa" },
  { state: "Benue", capital: "Makurdi" },
  { state: "Borno", capital: "Maiduguri" },
  { state: "Cross River", capital: "Calabar" },
  { state: "Delta", capital: "Asaba" },
  { state: "Ebonyi", capital: "Abakaliki" },
  { state: "Edo", capital: "Benin City" },
  { state: "Ekiti", capital: "Ado Ekiti" },
  { state: "Enugu", capital: "Enugu" },
  { state: "FCT", capital: "Abuja" },
  { state: "Gombe", capital: "Gombe" },
  { state: "Imo", capital: "Owerri" },
  { state: "Jigawa", capital: "Dutse" },
  { state: "Kaduna", capital: "Kaduna" },
  { state: "Kano", capital: "Kano" },
  { state: "Katsina", capital: "Katsina" },
  { state: "Kebbi", capital: "Birnin Kebbi" },
  { state: "Kogi", capital: "Lokoja" },
  { state: "Kwara", capital: "Ilorin" },
  { state: "Lagos", capital: "Ikeja" },
  { state: "Nasarawa", capital: "Lafia" },
  { state: "Niger", capital: "Minna" },
  { state: "Ogun", capital: "Abeokuta" },
  { state: "Ondo", capital: "Akure" },
  { state: "Osun", capital: "Osogbo" },
  { state: "Oyo", capital: "Ibadan" },
  { state: "Plateau", capital: "Jos" },
  { state: "Rivers", capital: "Port Harcourt" },
  { state: "Sokoto", capital: "Sokoto" },
  { state: "Taraba", capital: "Jalingo" },
  { state: "Yobe", capital: "Damaturu" },
  { state: "Zamfara", capital: "Gusau" }
];

let session = JSON.parse(localStorage.getItem("swiftlink-session") || "null");

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const signupRole = document.querySelector("#signupRole");
const loginRole = document.querySelector("#loginRole");
const loginEmailLabel = document.querySelector("#loginEmailLabel");
const loginEmailInput = loginForm.elements.email;
const authCardTitle = document.querySelector("#authCardTitle");
const authIntro = document.querySelector("#authIntro");
const authModeEyebrow = document.querySelector("#authModeEyebrow");
const authModeToggle = document.querySelector("#authModeToggle");
const modeButtons = document.querySelectorAll("[data-auth-mode]");
const signupCourierFields = document.querySelector("#signupCourierFields");
const roleTabs = document.querySelector(".role-tabs");
const workspaceLabel = document.querySelector("#workspaceLabel");
const userBar = document.querySelector("#userBar");
const sessionName = document.querySelector("#sessionName");
const logoutBtn = document.querySelector("#logoutBtn");
const bookingForm = document.querySelector("#bookingForm");
const customerTabs = document.querySelectorAll("[data-customer-tab]");
const customerPanels = {
  booking: document.querySelector("#customerBookingPanel"),
  deliveries: document.querySelector("#customerDeliveriesPanel"),
  queries: document.querySelector("#customerQueriesPanel")
};
const customerDeliveryCount = document.querySelector("#customerDeliveryCount");
const customerQueryCount = document.querySelector("#customerQueryCount");
const customerDeliveriesList = document.querySelector("#customerDeliveriesList");
const customerQueriesList = document.querySelector("#customerQueriesList");
const courierForm = document.querySelector("#courierForm");
const courierLookup = document.querySelector("#courierLookup");
const courierLookupControls = document.querySelector("#courierLookupControls");
const courierLookupBtn = document.querySelector("#courierLookupBtn");
const courierStatus = document.querySelector("#courierStatus");
const courierTitle = document.querySelector("#courier-title");
const courierHeaderStatus = document.querySelector("#courierHeaderStatus");
const courierSettingsForm = document.querySelector("#courierSettingsForm");
const courierStateSetting = document.querySelector("#courierStateSetting");
const availableJobs = document.querySelector("#availableJobs");
const courierTabs = document.querySelectorAll("[data-courier-tab]");
const courierPanels = {
  status: document.querySelector("#courierStatusPanel"),
  deliveries: document.querySelector("#courierDeliveriesPanel"),
  profile: document.querySelector("#courierProfilePanel")
};
const courierApplications = document.querySelector("#courierApplications");
const shipmentList = document.querySelector("#shipmentList");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = {
  couriers: document.querySelector("#adminCouriersPanel"),
  shipments: document.querySelector("#adminShipmentsPanel"),
  queries: document.querySelector("#adminQueriesPanel"),
  users: document.querySelector("#adminUsersPanel")
};
const courierTabCount = document.querySelector("#courierTabCount");
const shipmentTabCount = document.querySelector("#shipmentTabCount");
const queryTabCount = document.querySelector("#queryTabCount");
const userTabCount = document.querySelector("#userTabCount");
const queryList = document.querySelector("#queryList");
const userAdminTabs = document.querySelectorAll("[data-user-admin-tab]");
const adminCustomersList = document.querySelector("#adminCustomersList");
const adminCourierUsersList = document.querySelector("#adminCourierUsersList");
const toast = document.querySelector("#toast");
const refreshData = document.querySelector("#refreshData");
let selectedAuthRole = "customer";
let authMode = "login";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { "x-auth-token": session.token } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

async function refreshState() {
  state = {
    users: [],
    couriers: [],
    shipments: [],
    ...(await api("/api/state"))
  };
  render();
}

function roleName(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function stateDetails(name) {
  return nigeriaStates.find((item) => item.state === name) || nigeriaStates.find((item) => item.state === "Lagos");
}

function locationLabel(name) {
  const location = stateDetails(name);
  return `${location.state} - ${location.capital}`;
}

function courierState(courier) {
  return courier?.serviceState || courier?.state || "Lagos";
}

function shipmentState(shipment) {
  return shipment?.deliveryState || shipment?.state || "Lagos";
}

function populateStateSelects() {
  document.querySelectorAll("[data-nigeria-state-select]").forEach((select) => {
    const selected = select.value || "Lagos";
    select.innerHTML = nigeriaStates
      .map(
        (item) =>
          `<option value="${escapeHtml(item.state)}" ${item.state === selected ? "selected" : ""}>${escapeHtml(item.state)} - ${escapeHtml(item.capital)}</option>`
      )
      .join("");
  });
}

function setCourierSignupRequired(required) {
  signupCourierFields.querySelectorAll("input, select").forEach((field) => {
    if (field.name !== "vehicle") {
      field.required = required;
    }
  });
}

function setAuthMode(mode) {
  authMode = mode === "signup" && selectedAuthRole !== "admin" ? "signup" : "login";
  loginForm.classList.toggle("hidden", authMode !== "login");
  signupForm.classList.toggle("hidden", authMode !== "signup");
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.authMode === authMode));
  authCardTitle.textContent = `${roleName(selectedAuthRole)} ${authMode === "login" ? "log in" : "account"}`;
}

function applyAuthRole(role) {
  selectedAuthRole = role;
  loginRole.value = role;
  signupRole.value = role;
  authModeEyebrow.textContent = `${roleName(role)} access`;
  authIntro.textContent =
    role === "admin"
      ? "Admins use the private system account to review couriers and assignments."
      : "Log in to continue, or create a customer/courier account when you need one.";

  const isCourier = role === "courier";
  const isAdmin = role === "admin";
  loginEmailLabel.classList.toggle("hidden", isAdmin);
  loginEmailInput.required = !isAdmin;
  loginEmailInput.value = isAdmin ? "admin@swiftlink.local" : loginEmailInput.value === "admin@swiftlink.local" ? "" : loginEmailInput.value;
  signupCourierFields.classList.toggle("hidden", !isCourier);
  authModeToggle.classList.toggle("single-mode", isAdmin);
  modeButtons.forEach((button) => {
    const isSignupButton = button.dataset.authMode === "signup";
    button.disabled = isAdmin && isSignupButton;
    button.classList.toggle("hidden", isAdmin && isSignupButton);
  });
  setCourierSignupRequired(isCourier);
  setAuthMode(isAdmin ? "login" : authMode);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.name || file.size === 0) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read the selected photo.")));
    reader.readAsDataURL(file);
  });
}

function saveSession(token, user) {
  session = { token, user };
  localStorage.setItem("swiftlink-session", JSON.stringify(session));
  applyAuthUI();
}

function clearSession() {
  session = null;
  localStorage.removeItem("swiftlink-session");
  applyAuthUI();
}

function applyAuthUI() {
  const loggedIn = Boolean(session?.user);
  authScreen.classList.toggle("hidden", loggedIn);
  appShell.classList.toggle("hidden", !loggedIn);
  roleTabs.classList.toggle("hidden", loggedIn);
  workspaceLabel.classList.toggle("hidden", !loggedIn);
  userBar.classList.toggle("hidden", !loggedIn);

  tabs.forEach((tab) => {
    tab.disabled = false;
    tab.title = "";
  });

  if (!loggedIn) {
    sessionName.textContent = "";
    workspaceLabel.textContent = "";
    applyAuthRole(selectedAuthRole);
    return;
  }

  sessionName.textContent = session.user.name;
  workspaceLabel.textContent = `${roleName(session.user.role)} workspace`;
  switchView(session.user.role);

  if (session.user.role === "courier") {
    courierLookup.value = session.user.phone || "";
  }

  if (session.user.role === "customer") {
    const nameInput = bookingForm.elements.customerName;
    if (nameInput && !nameInput.value) {
      nameInput.value = session.user.name;
    }
  }
}

function badge(status) {
  const display = displayStatus(status);
  const badgeClass = display.toLowerCase().replace(/\s+/g, "-");
  return `<span class="badge ${badgeClass}">${escapeHtml(display)}</span>`;
}

function displayStatus(status) {
  return status === "Query raised" ? "Under investigation" : status;
}

function isUnderInvestigation(shipment) {
  return ["Under investigation", "Query raised"].includes(shipment?.status);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function deliveryChanges(shipment, courier) {
  const changes = [
    { label: "Booked", value: shipment.createdAt },
    { label: courier ? `Accepted by ${courier.name}` : "Waiting for courier", value: shipment.claimedAt },
    { label: "Marked delivered by courier", value: shipment.deliveredAt },
    { label: "Customer confirmed delivery", value: shipment.confirmedAt },
    { label: "Auto-completed after review window", value: shipment.autoCompletedAt },
    { label: "Under investigation", value: shipment.queriedAt }
  ].filter((item) => item.value);

  if (!changes.length) return "";

  return `
    <div class="delivery-changes" aria-label="Delivery changes">
      ${changes
        .map(
          (item) => `
            <span>
              <strong>${escapeHtml(item.label)}</strong>
              ${escapeHtml(formatDateTime(item.value))}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function setAdminTab(tabName) {
  adminTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.adminTab === tabName));
  Object.entries(adminPanels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

function setUserAdminTab(tabName) {
  userAdminTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.userAdminTab === tabName));
  adminCustomersList?.classList.toggle("active", tabName === "customers");
  adminCourierUsersList?.classList.toggle("active", tabName === "couriers");
}

function setCustomerTab(tabName) {
  customerTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.customerTab === tabName));
  Object.entries(customerPanels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

function setCourierTab(tabName) {
  courierTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.courierTab === tabName));
  Object.entries(courierPanels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

function updateAdminCounts() {
  const pendingCouriers = state.couriers.filter((courier) => courier.status === "pending").length;
  const openShipments = state.shipments.filter((shipment) => shipment.status !== "Delivered").length;
  const openQueries = state.shipments.filter(isUnderInvestigation).length;
  const managedUsers = (state.users || []).filter((user) => user.role !== "admin").length;
  courierTabCount.textContent = pendingCouriers;
  shipmentTabCount.textContent = openShipments;
  queryTabCount.textContent = openQueries;
  if (userTabCount) {
    userTabCount.textContent = managedUsers;
  }
}

function updateCustomerCounts() {
  customerDeliveryCount.textContent = state.shipments.length;
  customerQueryCount.textContent = state.shipments.filter(
    (shipment) => shipment.status === "Pending customer confirmation" || isUnderInvestigation(shipment)
  ).length;
}

function currentCourier() {
  if (session?.user?.role !== "courier") return null;
  return state.couriers.find((courier) => courier.userId === session.user.id || courier.phone === session.user.phone) || null;
}

function updateCourierHeader(courier) {
  if (session?.user?.role !== "courier") return;

  courierHeaderStatus.className = "status-pill";

  if (!courier) {
    courierTitle.textContent = "Complete your courier registration";
    courierHeaderStatus.classList.add("standby");
    courierHeaderStatus.textContent = "Registration required";
    return;
  }

  if (courier.status === "approved") {
    courierTitle.textContent = "Accept and complete deliveries";
    courierHeaderStatus.classList.add("ready");
    courierHeaderStatus.textContent = "Approved courier";
    return;
  }

  if (courier.status === "rejected") {
    courierTitle.textContent = "Courier registration needs attention";
    courierHeaderStatus.classList.add("rejected");
    courierHeaderStatus.textContent = "Not approved";
    return;
  }

  courierTitle.textContent = "Registration under review";
  courierHeaderStatus.classList.add("standby");
  courierHeaderStatus.textContent = "Awaiting approval";
}

function switchView(viewName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  views.forEach((view) => view.classList.toggle("active", view.id === viewName));
  if (!session?.user) {
    applyAuthRole(viewName);
  }
}

function renderApplications() {
  if (!state.couriers.length) {
    courierApplications.innerHTML = `<div class="tracking-card empty">No courier applications yet.</div>`;
    return;
  }

  courierApplications.innerHTML = state.couriers
    .map(
      (courier) => `
        <article class="list-item">
          <div class="list-top">
            <strong>${escapeHtml(courier.name)}</strong>
            ${badge(courier.status)}
          </div>
          <p>${escapeHtml(courier.vehicle)} - ${escapeHtml(courier.area)}</p>
          <p>State: ${escapeHtml(locationLabel(courierState(courier)))}</p>
          <p>${escapeHtml(courier.phone)} - ${escapeHtml(courier.id)}</p>
          <p>License: ${escapeHtml(courier.driversLicense || "Not provided")} - Plate: ${escapeHtml(courier.plateNumber || "Not provided")}</p>
          ${
            courier.profilePhoto
              ? `<img class="courier-photo" src="${escapeHtml(courier.profilePhoto)}" alt="${escapeHtml(courier.name)} profile photo" />`
              : ""
          }
          ${
            courier.status === "pending"
              ? `<div class="actions">
                  <button class="small-btn" data-approve="${courier.id}">Approve</button>
                  <button class="small-btn reject" data-reject="${courier.id}">Reject</button>
                </div>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

function renderShipments() {
  if (!state.shipments.length) {
    shipmentList.innerHTML = `<div class="tracking-card empty">No shipments have been booked.</div>`;
    return;
  }

  shipmentList.innerHTML = state.shipments
    .map((shipment) => {
      const courier = state.couriers.find((item) => item.id === shipment.courierId);

      return `
        <article class="list-item">
          <div class="list-top">
            <strong>${escapeHtml(shipment.id)}</strong>
            ${badge(shipment.status)}
          </div>
          <p>${escapeHtml(shipment.customerName)}: ${escapeHtml(shipment.pickup)} to ${escapeHtml(shipment.dropoff)}</p>
          <p>Delivery state: ${escapeHtml(locationLabel(shipmentState(shipment)))}</p>
          <p>${escapeHtml(shipment.packageType)}${shipment.notes ? ` - ${escapeHtml(shipment.notes)}` : ""}</p>
          <p>Courier: ${courier ? escapeHtml(courier.name) : "Waiting for courier selection"}</p>
          ${deliveryChanges(shipment, courier)}
          ${shipment.queryText ? `<p class="query-text">${escapeHtml(shipment.queryText)}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderQueries() {
  const queriedShipments = state.shipments.filter(isUnderInvestigation);

  if (!queriedShipments.length) {
    queryList.innerHTML = `<div class="tracking-card empty">No deliveries are under investigation.</div>`;
    return;
  }

  queryList.innerHTML = queriedShipments
    .map((shipment) => {
      const courier = state.couriers.find((item) => item.id === shipment.courierId);

      return `
        <article class="list-item">
          <div class="list-top">
            <strong>${escapeHtml(shipment.id)}</strong>
            ${badge(shipment.status)}
          </div>
          <p>${escapeHtml(shipment.customerName)}: ${escapeHtml(shipment.pickup)} to ${escapeHtml(shipment.dropoff)}</p>
          <p>Delivery state: ${escapeHtml(locationLabel(shipmentState(shipment)))}</p>
          <p>Courier: ${courier ? escapeHtml(courier.name) : "No courier assigned"}</p>
          <p class="query-text">${escapeHtml(shipment.queryText || "No query details supplied.")}</p>
        </article>
      `;
    })
    .join("");
}

function renderAdminUsers() {
  if (!adminCustomersList || !adminCourierUsersList) return;

  const users = state.users || [];
  const customers = users.filter((user) => user.role === "customer");
  const courierUsers = users.filter((user) => user.role === "courier");

  adminCustomersList.innerHTML = customers.length
    ? customers.map(renderCustomerUserCard).join("")
    : `<div class="tracking-card empty">No customer accounts yet.</div>`;

  adminCourierUsersList.innerHTML = courierUsers.length
    ? courierUsers.map(renderCourierUserCard).join("")
    : `<div class="tracking-card empty">No courier accounts yet.</div>`;
}

function renderCustomerUserCard(user) {
  const deliveries = state.shipments.filter((shipment) => shipment.customerId === user.id);
  const openDeliveries = deliveries.filter((shipment) => shipment.status !== "Delivered").length;

  return `
    <article class="list-item">
      <div class="list-top">
        <strong>${escapeHtml(user.name)}</strong>
        ${badge("Customer")}
      </div>
      <p>Email: ${escapeHtml(user.email)}</p>
      <p>Phone: ${escapeHtml(user.phone || "Not provided")}</p>
      <p>User ID: ${escapeHtml(user.id)}</p>
      <p>Joined: ${escapeHtml(formatDateTime(user.createdAt) || "Not recorded")}</p>
      <div class="user-account-stats" aria-label="Customer account summary">
        <span><strong>${deliveries.length}</strong> deliveries</span>
        <span><strong>${openDeliveries}</strong> open</span>
      </div>
      ${userDeliverySummary(deliveries)}
      <div class="actions">
        <button class="small-btn reject" data-delete-user="${escapeHtml(user.id)}">Delete account</button>
      </div>
    </article>
  `;
}

function renderCourierUserCard(user) {
  const courier = state.couriers.find((item) => item.userId === user.id || item.phone === user.phone);
  const deliveries = courier ? state.shipments.filter((shipment) => shipment.courierId === courier.id) : [];
  const openDeliveries = deliveries.filter((shipment) => shipment.status !== "Delivered" && !isUnderInvestigation(shipment)).length;

  return `
    <article class="list-item">
      <div class="list-top">
        <strong>${escapeHtml(user.name)}</strong>
        ${badge(courier?.status || "Courier")}
      </div>
      <p>Email: ${escapeHtml(user.email)}</p>
      <p>Phone: ${escapeHtml(user.phone || courier?.phone || "Not provided")}</p>
      <p>User ID: ${escapeHtml(user.id)}</p>
      <p>Courier ID: ${escapeHtml(courier?.id || "No courier profile")}</p>
      <p>Vehicle: ${escapeHtml(courier?.vehicle || "Not provided")} - Area: ${escapeHtml(courier?.area || "Not provided")}</p>
      <p>State: ${escapeHtml(courier ? locationLabel(courierState(courier)) : "Not provided")}</p>
      <p>License: ${escapeHtml(courier?.driversLicense || "Not provided")} - Plate: ${escapeHtml(courier?.plateNumber || "Not provided")}</p>
      <p>Joined: ${escapeHtml(formatDateTime(user.createdAt) || "Not recorded")}</p>
      ${
        courier?.profilePhoto
          ? `<img class="courier-photo" src="${escapeHtml(courier.profilePhoto)}" alt="${escapeHtml(user.name)} profile photo" />`
          : ""
      }
      <div class="user-account-stats" aria-label="Courier account summary">
        <span><strong>${deliveries.length}</strong> deliveries</span>
        <span><strong>${openDeliveries}</strong> active</span>
      </div>
      ${userDeliverySummary(deliveries)}
      <div class="actions">
        <button class="small-btn reject" data-delete-user="${escapeHtml(user.id)}">Delete account</button>
      </div>
    </article>
  `;
}

function userDeliverySummary(deliveries) {
  if (!deliveries.length) {
    return `<p class="account-deliveries">No linked deliveries.</p>`;
  }

  return `
    <div class="account-deliveries">
      ${deliveries
        .map((shipment) => `<span>${escapeHtml(shipment.id)} - ${escapeHtml(displayStatus(shipment.status))}</span>`)
        .join("")}
    </div>
  `;
}

function renderCustomerDeliveries() {
  if (!state.shipments.length) {
    customerDeliveriesList.innerHTML = `<div class="tracking-card empty">No deliveries yet.</div>`;
    return;
  }

  customerDeliveriesList.innerHTML = state.shipments
    .map((shipment) => {
      const courier = state.couriers.find((item) => item.id === shipment.courierId);
      const needsReview = shipment.status === "Pending customer confirmation";

      return `
        <article class="list-item">
          <div class="list-top">
            <strong>${escapeHtml(shipment.id)}</strong>
            ${badge(shipment.status)}
          </div>
          <p>${escapeHtml(shipment.pickup)} to ${escapeHtml(shipment.dropoff)}</p>
          <p>Delivery state: ${escapeHtml(locationLabel(shipmentState(shipment)))}</p>
          <p>Courier: ${courier ? escapeHtml(courier.name) : "Waiting for assignment"}</p>
          ${shipment.queryText ? `<p class="query-text">${escapeHtml(shipment.queryText)}</p>` : ""}
          ${
            needsReview
              ? `<div class="actions">
                  <button class="small-btn" data-confirm-delivery="${shipment.id}">Confirm delivery</button>
                  <button class="small-btn reject" data-open-query="${shipment.id}">Raise query</button>
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function renderCustomerQueries() {
  const queryableShipments = state.shipments.filter((shipment) => shipment.status === "Pending customer confirmation");
  const raisedQueries = state.shipments.filter(isUnderInvestigation);

  if (!queryableShipments.length && !raisedQueries.length) {
    customerQueriesList.innerHTML = `<div class="tracking-card empty">No deliveries need a query right now.</div>`;
    return;
  }

  const queryForms = queryableShipments
    .map((shipment) => {
      const courier = state.couriers.find((item) => item.id === shipment.courierId);

      return `
        <article class="list-item" id="query-${escapeHtml(shipment.id)}">
          <div class="list-top">
            <strong>${escapeHtml(shipment.id)}</strong>
            ${badge(shipment.status)}
          </div>
          <p>${escapeHtml(shipment.pickup)} to ${escapeHtml(shipment.dropoff)}</p>
          <p>Courier: ${courier ? escapeHtml(courier.name) : "Waiting for assignment"}</p>
          <form class="query-form" data-query-form="${escapeHtml(shipment.id)}">
            <label>
              Query details
              <textarea name="query" rows="3" required placeholder="Tell admin what should be investigated..."></textarea>
            </label>
            <button class="small-btn reject" type="submit">Send query</button>
          </form>
        </article>
      `;
    })
    .join("");

  const queryHistory = raisedQueries
    .map((shipment) => {
      const courier = state.couriers.find((item) => item.id === shipment.courierId);

      return `
        <article class="list-item">
          <div class="list-top">
            <strong>${escapeHtml(shipment.id)}</strong>
            ${badge(shipment.status)}
          </div>
          <p>${escapeHtml(shipment.pickup)} to ${escapeHtml(shipment.dropoff)}</p>
          <p>Courier: ${courier ? escapeHtml(courier.name) : "No courier assigned"}</p>
          <p class="query-text">${escapeHtml(shipment.queryText || "No query details supplied.")}</p>
        </article>
      `;
    })
    .join("");

  customerQueriesList.innerHTML = `
    ${
      queryForms
        ? `<div class="query-group"><h3>Ready for review</h3>${queryForms}</div>`
        : ""
    }
    ${
      queryHistory
        ? `<div class="query-group"><h3>Under investigation</h3>${queryHistory}</div>`
        : ""
    }
  `;
}

function deliveryAction(job) {
  if (job.status === "Out for delivery") {
    return `<button class="small-btn" data-complete="${job.id}">Mark complete</button>`;
  }

  if (job.status === "Pending customer confirmation") {
    return `<button class="small-btn muted" disabled>Waiting for customer</button>`;
  }

  if (isUnderInvestigation(job)) {
    return `<button class="small-btn reject" disabled>Under investigation</button>`;
  }

  if (job.status === "Delivered") {
    return `<button class="small-btn muted" disabled>Completed</button>`;
  }

  return "";
}

function deliveryCard(job, action = "") {
  return `
    <article class="list-item">
      <div class="list-top">
        <strong>${escapeHtml(job.id)}</strong>
        ${badge(job.status)}
      </div>
      <p>${escapeHtml(job.customerName)}: ${escapeHtml(job.pickup)} to ${escapeHtml(job.dropoff)}</p>
      <p>Delivery state: ${escapeHtml(locationLabel(shipmentState(job)))}</p>
      <p>${escapeHtml(job.packageType)}${job.notes ? ` - ${escapeHtml(job.notes)}` : ""}</p>
      ${job.queryText ? `<p class="query-text">${escapeHtml(job.queryText)}</p>` : ""}
      ${action ? `<div class="actions">${action}</div>` : ""}
    </article>
  `;
}

function renderCourierLookup(phone) {
  const courier = state.couriers.find((item) => item.phone.trim() === phone.trim());

  if (!courier) {
    courierStatus.innerHTML = "No courier found with that phone number.";
    availableJobs.innerHTML = "";
    return;
  }

  if (courier.status === "pending") {
    courierStatus.innerHTML = `<strong>${escapeHtml(courier.name)}</strong> is on standby. Admin authorisation is still pending.`;
    availableJobs.innerHTML = `<div class="tracking-card empty">Deliveries will appear here after admin approval.</div>`;
    return;
  }

  if (courier.status === "rejected") {
    courierStatus.innerHTML = `<strong>${escapeHtml(courier.name)}</strong> was not approved. Please contact admin for the next steps.`;
    availableJobs.innerHTML = `<div class="tracking-card empty">No deliveries are available for this courier account.</div>`;
    return;
  }

  const activeState = courierState(courier);
  const available = state.shipments.filter(
    (shipment) => !shipment.courierId && shipment.status === "Awaiting courier" && shipmentState(shipment) === activeState
  );
  const jobs = state.shipments.filter((shipment) => shipment.courierId === courier.id);
  const activeJobs = jobs.filter((shipment) => shipment.status !== "Delivered" && !isUnderInvestigation(shipment));
  const completedJobs = jobs.filter((shipment) => shipment.status === "Delivered" || isUnderInvestigation(shipment));

  courierStatus.innerHTML = `
    <strong>${escapeHtml(courier.name)}</strong> is active in ${escapeHtml(locationLabel(activeState))}.
    <div class="courier-metrics" aria-label="Courier delivery summary">
      <span><strong>${available.length}</strong> available</span>
      <span><strong>${activeJobs.length}</strong> active</span>
      <span><strong>${completedJobs.length}</strong> closed</span>
    </div>
  `;
  availableJobs.innerHTML = `
    <div class="job-section">
      <h3>Available deliveries</h3>
      ${
        available.length
          ? available
              .map(
                (job) => deliveryCard(job, `<button class="small-btn" data-claim="${job.id}">Accept delivery</button>`)
              )
              .join("")
          : `<div class="tracking-card empty">No open deliveries in ${escapeHtml(locationLabel(activeState))}.</div>`
      }
    </div>
    <div class="job-section">
      <h3>Active deliveries</h3>
      ${
        activeJobs.length
          ? activeJobs.map((job) => deliveryCard(job, deliveryAction(job))).join("")
          : `<div class="tracking-card empty">No active deliveries yet.</div>`
      }
    </div>
    <div class="job-section">
      <h3>Closed deliveries</h3>
      ${
        completedJobs.length
          ? completedJobs.map((job) => deliveryCard(job, deliveryAction(job))).join("")
          : `<div class="tracking-card empty">Completed deliveries will appear here.</div>`
      }
    </div>
  `;
}

function render() {
  updateAdminCounts();
  updateCustomerCounts();
  renderCustomerDeliveries();
  renderCustomerQueries();
  renderApplications();
  renderShipments();
  renderQueries();
  renderAdminUsers();
  const courier = currentCourier();
  updateCourierHeader(courier);
  courierForm.classList.toggle("hidden", Boolean(courier));
  courierSettingsForm.classList.toggle("hidden", !courier);
  courierLookupControls.classList.toggle("hidden", Boolean(courier));

  if (!courier) {
    setCourierTab("profile");
    availableJobs.innerHTML = `<div class="tracking-card empty">Active deliveries will appear here after your account is ready.</div>`;
  }

  if (courier) {
    courierStateSetting.value = courierState(courier);
  } else if (session?.user?.role === "courier" && session.user.phone) {
    courierLookup.value = session.user.phone;
  }

  if (courier) {
    renderCourierLookup(courier.phone);
  } else if (courierLookup.value) {
    renderCourierLookup(courierLookup.value);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.disabled) return;
    switchView(tab.dataset.view);
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => setAdminTab(tab.dataset.adminTab));
});

userAdminTabs.forEach((tab) => {
  tab.addEventListener("click", () => setUserAdminTab(tab.dataset.userAdminTab));
});

customerTabs.forEach((tab) => {
  tab.addEventListener("click", () => setCustomerTab(tab.dataset.customerTab));
});

courierTabs.forEach((tab) => {
  tab.addEventListener("click", () => setCourierTab(tab.dataset.courierTab));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  try {
    const { token, user } = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("role") === "admin" ? "admin@swiftlink.local" : formData.get("email"),
        password: formData.get("password")
      })
    });

    if (user.role !== formData.get("role")) {
      showToast(`This account is registered as ${user.role}.`);
      return;
    }

    saveSession(token, user);
    await refreshState();
    loginForm.reset();
    showToast(`Welcome back, ${user.name}.`);
  } catch (error) {
    showToast(error.message);
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);

  try {
    const { token, user } = await api("/api/signup", {
      method: "POST",
      body: JSON.stringify({
        role: formData.get("role"),
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        phone: formData.get("phone"),
        vehicle: formData.get("vehicle"),
        serviceState: formData.get("serviceState"),
        area: formData.get("area"),
        profilePhoto: await fileToDataUrl(formData.get("profilePhoto")),
        driversLicense: formData.get("driversLicense"),
        plateNumber: formData.get("plateNumber")
      })
    });

    saveSession(token, user);
    await refreshState();
    signupForm.reset();
    applyAuthRole(selectedAuthRole);
    showToast(user.role === "courier" ? "Courier account created. You are on standby until admin authorisation." : "Account created.");
  } catch (error) {
    showToast(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    if (session?.token) {
      await api("/api/logout", { method: "POST" });
    }
  } catch (error) {
    showToast(error.message);
  }

  clearSession();
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);

  try {
    const { shipment } = await api("/api/shipments", {
      method: "POST",
      body: JSON.stringify({
        customerName: formData.get("customerName") || session.user.name,
        pickup: formData.get("pickup"),
        dropoff: formData.get("dropoff"),
        deliveryState: formData.get("deliveryState"),
        packageType: formData.get("packageType"),
        notes: formData.get("notes")
      })
    });

    await refreshState();
    bookingForm.reset();
    setCustomerTab("deliveries");
    showToast(`Shipment booked. Delivery ID: ${shipment.id}`);
  } catch (error) {
    showToast(error.message);
  }
});

customerDeliveriesList.addEventListener("click", async (event) => {
  const confirmId = event.target.dataset.confirmDelivery;
  const queryId = event.target.dataset.openQuery || event.target.dataset.queryDelivery;
  const shipmentId = confirmId || queryId;
  if (!shipmentId) return;

  try {
    if (confirmId) {
      await api(`/api/shipments/${shipmentId}/confirm`, {
        method: "PATCH"
      });
      await refreshState();
      showToast("Delivery confirmed.");
      return;
    }

    const query = window.prompt("What should admin investigate about this delivery?");
    if (!query || !query.trim()) return;

    await api(`/api/shipments/${shipmentId}/query`, {
      method: "PATCH",
      body: JSON.stringify({ query })
    });
    await refreshState();
    showToast("Query sent. This delivery is now under investigation.");
  } catch (error) {
    showToast(error.message);
  }
});

customerQueriesList.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-query-form]");
  if (!form) return;
  event.preventDefault();

  const shipmentId = form.dataset.queryForm;
  const formData = new FormData(form);
  const query = String(formData.get("query") || "").trim();
  if (!query) return;

  try {
    await api(`/api/shipments/${shipmentId}/query`, {
      method: "PATCH",
      body: JSON.stringify({ query })
    });
    await refreshState();
    showToast("Query sent. This delivery is now under investigation.");
  } catch (error) {
    showToast(error.message);
  }
});

courierForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(courierForm);

  try {
    const { courier } = await api("/api/couriers", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        vehicle: formData.get("vehicle"),
        serviceState: formData.get("serviceState"),
        area: formData.get("area"),
        profilePhoto: await fileToDataUrl(formData.get("profilePhoto")),
        driversLicense: formData.get("driversLicense"),
        plateNumber: formData.get("plateNumber")
      })
    });

    await refreshState();
    courierLookup.value = courier.phone;
    renderCourierLookup(courier.phone);
    courierForm.reset();
    showToast("Courier registered and placed on standby for admin authorisation.");
  } catch (error) {
    showToast(error.message);
  }
});

courierLookupBtn.addEventListener("click", () => renderCourierLookup(courierLookup.value));

courierApplications.addEventListener("click", async (event) => {
  const approveId = event.target.dataset.approve;
  const rejectId = event.target.dataset.reject;
  const courier = state.couriers.find((item) => item.id === (approveId || rejectId));

  if (!courier) return;

  try {
    const status = approveId ? "approved" : "rejected";
    await api(`/api/couriers/${courier.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    await refreshState();
    showToast(`${courier.name} has been ${status}.`);
  } catch (error) {
    showToast(error.message);
  }
});

adminCustomersList?.addEventListener("click", handleAdminUserDelete);
adminCourierUsersList?.addEventListener("click", handleAdminUserDelete);

async function handleAdminUserDelete(event) {
  const userId = event.target.dataset.deleteUser;
  if (!userId) return;

  const user = state.users.find((item) => item.id === userId);
  if (!user) return;

  const confirmed = window.confirm(`Delete ${user.name}'s ${user.role} account? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await api(`/api/users/${userId}`, { method: "DELETE" });
    await refreshState();
    showToast(`${user.name}'s account has been deleted.`);
  } catch (error) {
    showToast(error.message);
  }
}

availableJobs.addEventListener("click", async (event) => {
  const claimId = event.target.dataset.claim;
  if (claimId) {
    try {
      await api(`/api/shipments/${claimId}/claim`, {
        method: "PATCH"
      });
      await refreshState();
      showToast("Delivery accepted.");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const shipmentId = event.target.dataset.complete;
  if (!shipmentId) return;

  const shipment = state.shipments.find((item) => item.id === shipmentId);
  if (shipment) {
    if (shipment.status === "Delivered") {
      showToast("This delivery is already complete.");
      return;
    }

    if (shipment.status !== "Out for delivery") {
      showToast("This delivery cannot be completed from its current status.");
      return;
    }

    try {
      await api(`/api/shipments/${shipment.id}/deliver`, {
        method: "PATCH"
      });
      await refreshState();
      showToast("Delivery marked complete. Waiting for customer confirmation.");
    } catch (error) {
      showToast(error.message);
    }
  }
});

courierSettingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const courier = currentCourier();
  if (!courier) return;

  try {
    await api("/api/couriers/me/location", {
      method: "PATCH",
      body: JSON.stringify({ serviceState: courierStateSetting.value })
    });
    await refreshState();
    showToast(`Location updated to ${locationLabel(courierStateSetting.value)}.`);
  } catch (error) {
    showToast(error.message);
  }
});

refreshData.addEventListener("click", async () => {
  await refreshState();
  if (!currentCourier()) {
    courierLookup.value = "";
    courierStatus.textContent = "Registered couriers stay on standby until admin authorisation is complete.";
    availableJobs.innerHTML = "";
  }
  showToast("Data refreshed.");
});

populateStateSelects();
createIcons();
applyAuthUI();
if (session?.token) {
  refreshState().catch((error) => {
    courierApplications.innerHTML = `<div class="tracking-card empty">Could not connect to the server.</div>`;
    shipmentList.innerHTML = `<div class="tracking-card empty">Start the server with npm start, then refresh this page.</div>`;
    showToast(error.message);
  });
}
