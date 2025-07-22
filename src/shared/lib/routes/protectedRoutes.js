/**
 * Маршруты, требующие валидацию профиля пользователя
 */
export const PROFILE_VALIDATION_REQUIRED_ROUTES = [
  '/warehouse-order',
  '/box-order',
  '/order-box'
];

/**
 * Проверяет, требует ли маршрут валидацию профиля
 * @param {string} pathname - Текущий путь
 * @returns {boolean} Требует ли маршрут валидацию
 */
export const isProfileValidationRequired = (pathname) => {
  return PROFILE_VALIDATION_REQUIRED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
};

/**
 * Добавляет новый маршрут в список защищённых
 * @param {string} route - Новый маршрут
 */
export const addProtectedRoute = (route) => {
  if (!PROFILE_VALIDATION_REQUIRED_ROUTES.includes(route)) {
    PROFILE_VALIDATION_REQUIRED_ROUTES.push(route);
  }
};