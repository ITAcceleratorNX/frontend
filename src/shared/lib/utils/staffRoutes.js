export const getUserProfilePath = (userId, staffRole) =>
  staffRole === 'ADMIN'
    ? `/admin/users/${userId}/profile`
    : `/personal-account/manager/users/${userId}`;

export const CLIENTS_AND_ORDERS_SECTION = 'clientsAndOrders';

/** Maps legacy activeSection keys to the new section + tab mode */
export const resolveClientsAndOrdersLegacySection = (section) => {
  const clientsKeys = new Set(['adminusers', 'managerusers']);
  const ordersKeys = new Set(['ordersManagement', 'request']);
  const paymentsKeys = new Set(['adminpayments']);
  const movingKeys = new Set(['adminmoving', 'managermoving']);

  if (clientsKeys.has(section)) {
    return { section: CLIENTS_AND_ORDERS_SECTION, mode: 'clients' };
  }
  if (ordersKeys.has(section)) {
    return { section: CLIENTS_AND_ORDERS_SECTION, mode: 'orders' };
  }
  if (paymentsKeys.has(section)) {
    return { section: CLIENTS_AND_ORDERS_SECTION, mode: 'payments' };
  }
  if (movingKeys.has(section)) {
    return { section: CLIENTS_AND_ORDERS_SECTION, mode: 'moving' };
  }
  return null;
};
