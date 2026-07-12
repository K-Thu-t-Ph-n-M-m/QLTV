document.addEventListener("DOMContentLoaded", () => {
  initializeRememberLogin();
  updateUserHeaderUI(); // Kích hoạt đổi giao diện Header tự động
});

function initializeRememberLogin() {
  if (Storage.getCurrentUser()) return;
  const rememberUser = Storage.getRememberLogin();
  if (!rememberUser) return;
  Storage.setCurrentUser(rememberUser);
}

function updateUserHeaderUI() {
  // Chỉ chạy ở giao diện Người dùng (Không chạy trong thư mục Admin)
  if (window.location.pathname.includes("/admin/")) return;

  const topbarActions = document.querySelector(".topbar__actions");
  if (!topbarActions) return;

  const currentUser = Storage.getCurrentUser();
  const themeToggleHtml = `<button class="theme-toggle" id="themeToggle" aria-label="Chuyển theme">🌙</button>`;

  if (currentUser) {
    // ĐÃ ĐĂNG NHẬP -> Hiện Avatar, Tên và nút Đăng xuất
    const displayName = currentUser.name || currentUser.fullName || "Độc giả";
    const avatar =
      currentUser.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

    // Nếu là Admin/Thủ thư, hiển thị thêm nút quay về trang Quản trị
    const adminBtn =
      currentUser.role === "admin" || currentUser.role === "Thủ thư"
        ? `<a class="btn btn--ghost" style="padding: 6px 12px; font-size: 0.85rem;" href="admin/dashboard.html">Vào Quản trị</a>`
        : "";

    topbarActions.innerHTML = `
      ${themeToggleHtml}
      <div style="display: flex; align-items: center; gap: 12px; margin-left: 12px;">
        ${adminBtn}
        <img src="${avatar}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6;">
        <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-color, #111827);">${displayName}</span>
        <button class="btn btn--primary" style="padding: 6px 16px; font-size: 0.85rem; margin-left: 8px;" onclick="window.logout()">Đăng xuất</button>
      </div>
    `;
  } else {
    // CHƯA ĐĂNG NHẬP -> Trả lại nút Đăng nhập / Đăng ký
    topbarActions.innerHTML = `
      ${themeToggleHtml}
      <a class="btn btn--ghost" href="login.html">Đăng nhập</a>
      <a class="btn btn--primary" href="register.html">Đăng ký</a>
    `;
  }

  // Khôi phục lại icon Mặt trăng/Mặt trời cho nút Theme
  const currentTheme =
    document.body.getAttribute("data-theme") ||
    (Storage.getTheme && Storage.getTheme()) ||
    "light";
  const toggleBtn = topbarActions.querySelector(".theme-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  }
}

function requireLogin() {
  const currentUser = Storage.getCurrentUser();
  if (currentUser) return true;

  const inAdmin = window.location.pathname.includes("/admin/");
  window.location.href = inAdmin ? "../login.html" : "login.html";
  return false;
}

function requireAdmin() {
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = "../login.html";
    return false;
  }
  if (currentUser.role !== "admin" && currentUser.role !== "Thủ thư") {
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

function redirectIfLoggedIn() {
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) return;

  const currentPage = window.location.pathname.split("/").pop().toLowerCase();
  if (currentPage !== "login.html" && currentPage !== "register.html") {
    return;
  }

  if (currentUser.role === "admin" || currentUser.role === "Thủ thư") {
    window.location.href = "admin/dashboard.html";
  } else {
    window.location.href = "index.html";
  }
}

// Lệnh đăng xuất toàn cục
window.logout = function () {
  Storage.logout();
  Storage.clearRememberLogin();

  if (typeof showNotification === "function") {
    showNotification("Đã đăng xuất tài khoản.", "info");
  }

  setTimeout(() => {
    const inAdmin = window.location.pathname.includes("/admin/");
    window.location.href = inAdmin ? "../login.html" : "login.html";
  }, 500);
};
