const STORAGE_KEYS = {
  USERS: "library_users",
  CURRENT_USER: "library_current_user",
  REMEMBER_LOGIN: "library_remember_login",
  BOOKS: "library_books",
  BORROWS: "library_borrows",
  RESERVATIONS: "library_reservations",
  SUPPLIERS: "library_suppliers",
  REPORTS: "library_reports",
  THEME: "library_theme",
};

const Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);

      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },

  getUsers() {
    return this.get(STORAGE_KEYS.USERS, []);
  },

  saveUsers(users) {
    this.set(STORAGE_KEYS.USERS, users);
  },

  addUser(user) {
    const users = this.getUsers();

    users.push(user);

    this.saveUsers(users);
  },

  updateUser(user) {
    const users = this.getUsers();

    const index = users.findIndex((item) => item.id === user.id);

    if (index === -1) return;

    users[index] = user;

    this.saveUsers(users);
  },

  findUser(account) {
    return this.getUsers().find(
      (user) => user.email === account || user.username === account,
    );
  },

  getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER);
  },

  setCurrentUser(user) {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  },

  logout() {
    this.remove(STORAGE_KEYS.CURRENT_USER);
  },

  getRememberLogin() {
    return this.get(STORAGE_KEYS.REMEMBER_LOGIN);
  },

  saveRememberLogin(user) {
    this.set(STORAGE_KEYS.REMEMBER_LOGIN, user);
  },

  clearRememberLogin() {
    this.remove(STORAGE_KEYS.REMEMBER_LOGIN);
  },

  getBooks() {
    return this.get(STORAGE_KEYS.BOOKS, []);
  },

  saveBooks(data) {
    this.set(STORAGE_KEYS.BOOKS, data);
  },

  getBorrows() {
    return this.get(STORAGE_KEYS.BORROWS, []);
  },

  saveBorrows(data) {
    this.set(STORAGE_KEYS.BORROWS, data);
  },

  getReservations() {
    return this.get(STORAGE_KEYS.RESERVATIONS, []);
  },

  saveReservations(data) {
    this.set(STORAGE_KEYS.RESERVATIONS, data);
  },

  getSuppliers() {
    return this.get(STORAGE_KEYS.SUPPLIERS, []);
  },

  saveSuppliers(data) {
    this.set(STORAGE_KEYS.SUPPLIERS, data);
  },

  getReports() {
    return this.get(STORAGE_KEYS.REPORTS, []);
  },

  saveReports(data) {
    this.set(STORAGE_KEYS.REPORTS, data);
  },

  getTheme() {
    return this.get(STORAGE_KEYS.THEME, "light");
  },

  saveTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
  },
};
