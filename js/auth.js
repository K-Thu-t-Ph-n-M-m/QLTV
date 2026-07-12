document.addEventListener("DOMContentLoaded", () => {
  initializeDefaultAdmin();
  initializeLoginForm();
  initializeRegisterForm();
});

function initializeDefaultAdmin() {
  const users = Storage.getUsers() || [];
  const admin = users.find((user) => user.role === "admin");

  if (admin) return;

  // Đẩy admin lên đầu danh sách
  users.unshift({
    id: "admin-1",
    fullName: "Quản trị viên",
    username: "admin",
    email: "admin@gmail.com",
    phone: "0123456789",
    password: btoa("123456"),
    avatar: "https://ui-avatars.com/api/?name=Admin&background=random",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
    lastLogin: null,
  });

  Storage.saveUsers(users);
}

function initializeRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;
  form.addEventListener("submit", register);
}

function initializeLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", login);
}

function register(event) {
  event.preventDefault();

  const fullName = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername").value.trim();
  const email = document
    .getElementById("registerEmail")
    .value.trim()
    .toLowerCase();
  const phone = document.getElementById("registerPhone").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword",
  ).value;

  if (!fullName || !username || !email || !phone || !password) {
    showNotification("Vui lòng nhập đầy đủ thông tin.", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Mật khẩu xác nhận không khớp.", "error");
    return;
  }

  const users = Storage.getUsers() || [];

  // FIX LỖI CRASH: Kiểm tra an toàn u.username có tồn tại không
  const exists = users.find(
    (u) =>
      u.email === email ||
      (u.username && u.username.toLowerCase() === username.toLowerCase()),
  );

  if (exists) {
    showNotification("Email hoặc tên đăng nhập đã tồn tại.", "error");
    return;
  }

  const user = {
    id: Date.now().toString(),
    fullName: fullName,
    name: fullName, // Lưu thêm trường name để đồng bộ bảng Admin
    username: username,
    email: email,
    phone: phone,
    password: btoa(password),
    avatar:
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(fullName) +
      "&background=random",
    role: "Độc giả",
    status: "active",
    createdAt: new Date().toISOString(),
    lastLogin: null,
    borrowHistory: [],
    favoriteCategories: [],
  };

  users.push(user);
  Storage.saveUsers(users);

  showNotification("Đăng ký tài khoản thành công!", "success");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
}

function login(event) {
  event.preventDefault();

  const account = document
    .getElementById("loginEmail")
    .value.trim()
    .toLowerCase();
  const rawPassword = document.getElementById("loginPassword").value;
  const encodedPassword = btoa(rawPassword);
  const remember = document.getElementById("rememberLogin");

  const users = Storage.getUsers() || [];

  // FIX LỖI CRASH: Bỏ qua lỗi với tài khoản ảo thiếu username
  const user = users.find(
    (item) =>
      item.email === account ||
      (item.username && item.username.toLowerCase() === account),
  );

  if (!user) {
    showNotification("Tài khoản không tồn tại.", "error");
    return;
  }

  // TÍNH NĂNG MỚI: Nếu là tài khoản sinh tự động từ file JSON (không có password), cho phép đăng nhập bằng 123456
  const userPassword = user.password || "123456";

  if (userPassword !== encodedPassword && userPassword !== rawPassword) {
    showNotification("Sai mật khẩu.", "error");
    return;
  }

  user.lastLogin = new Date().toISOString();
  Storage.updateUser(user);
  Storage.setCurrentUser(user);

  if (remember && remember.checked) {
    Storage.saveRememberLogin(user);
  } else {
    Storage.clearRememberLogin();
  }

  showNotification("Đăng nhập thành công!", "success");

  // Nếu là Admin hoặc Thủ thư thì vào trang quản trị
  setTimeout(() => {
    if (user.role === "admin" || user.role === "Thủ thư") {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "index.html"; // Độc giả về trang chủ
    }
  }, 800);
}

function getCurrentUser() {
  return Storage.getCurrentUser();
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function isAdmin() {
  const user = getCurrentUser();
  return user && (user.role === "admin" || user.role === "Thủ thư");
}
