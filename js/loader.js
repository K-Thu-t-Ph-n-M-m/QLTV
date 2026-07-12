const ROOT_PATH = window.location.pathname.includes("/admin/") ? "../" : "";

const DataLoader = {
  async initialize() {
    await this.loadUsers(); // Đã thêm lệnh nạp Thành viên
    await this.loadBooks();
    await this.loadSuppliers();
  },

  // Hàm mới thêm để đọc 150 users từ file JSON
  async loadUsers(forceReload = false) {
    const users = Storage.getUsers() || [];
    // Nếu trong hệ thống đã có nhiều hơn 1 người thì bỏ qua để không ghi đè
    if (!forceReload && users.length > 1) {
      return;
    }

    try {
      const response = await fetch(ROOT_PATH + "data/users.json");
      if (!response.ok) {
        throw new Error("Không tìm thấy data/users.json");
      }
      const jsonData = await response.json();

      // Giữ lại tài khoản Admin (để không bị mất quyền đăng nhập) và gộp với 150 người mới
      const adminUser = users.find((u) => u.role === "admin");
      const finalUsers = adminUser ? [adminUser, ...jsonData] : jsonData;

      Storage.saveUsers(finalUsers);
      console.log(`Đã tải ${jsonData.length} thành viên.`);
    } catch (error) {
      console.error("Lỗi tải users.json:", error);
    }
  },

  async loadBooks(forceReload = false) {
    if (!forceReload && Storage.getBooks().length > 0) {
      return;
    }

    try {
      const response = await fetch(ROOT_PATH + "data/books.json");
      if (!response.ok) {
        throw new Error("Không tìm thấy data/books.json");
      }
      const books = await response.json();
      Storage.saveBooks(books);
      console.log(`Đã tải ${books.length} quyển sách.`);
    } catch (error) {
      console.error("Lỗi tải books.json:", error);
    }
  },

  async loadSuppliers(forceReload = false) {
    if (!forceReload && Storage.getSuppliers().length > 0) {
      return;
    }

    try {
      const response = await fetch(ROOT_PATH + "data/suppliers.json");
      if (!response.ok) {
        return;
      }
      const suppliers = await response.json();
      Storage.saveSuppliers(suppliers);
      console.log(`Đã tải ${suppliers.length} nhà cung cấp.`);
    } catch (error) {
      console.error(error);
    }
  },

  async reloadBooks() {
    Storage.remove(STORAGE_KEYS.BOOKS);
    await this.loadBooks(true);
  },

  async reloadSuppliers() {
    Storage.remove(STORAGE_KEYS.SUPPLIERS);
    await this.loadSuppliers(true);
  },

  async reloadAll() {
    Storage.remove(STORAGE_KEYS.USERS);
    Storage.remove(STORAGE_KEYS.BOOKS);
    Storage.remove(STORAGE_KEYS.SUPPLIERS);
    await this.initialize();
  },

  clearDatabase() {
    Storage.remove(STORAGE_KEYS.USERS);
    Storage.remove(STORAGE_KEYS.BOOKS);
    Storage.remove(STORAGE_KEYS.SUPPLIERS);
    Storage.remove(STORAGE_KEYS.BORROWS);
    Storage.remove(STORAGE_KEYS.RESERVATIONS);
    Storage.remove(STORAGE_KEYS.REPORTS);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  DataLoader.initialize();
});
