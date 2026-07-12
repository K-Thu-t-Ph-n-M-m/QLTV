document.addEventListener("DOMContentLoaded", () => {
  // Hàm áp dụng theme và đổi icon
  const applyTheme = (nextTheme) => {
    document.body.setAttribute("data-theme", nextTheme);

    // Lưu vào kho chứa chung
    if (typeof Storage !== "undefined") {
      Storage.saveTheme(nextTheme);
    }

    // Cập nhật icon mặt trăng/mặt trời cho TẤT CẢ các nút đang có trên màn hình
    document
      .querySelectorAll(".theme-toggle, #themeToggle")
      .forEach((toggle) => {
        toggle.textContent = nextTheme === "dark" ? "☀️" : "🌙";
        toggle.setAttribute(
          "title",
          nextTheme === "dark"
            ? "Chuyển sang giao diện sáng"
            : "Chuyển sang giao diện tối",
        );
      });
  };

  // 1. Khởi tạo theme ban đầu khi vừa vào web
  const initTheme = () => {
    let savedTheme = "light";
    if (typeof Storage !== "undefined") {
      savedTheme = Storage.getTheme() || "light";
    }
    applyTheme(savedTheme);
  };

  initTheme();

  // 2. Kỹ thuật Event Delegation: Bắt sự kiện click trên TOÀN BỘ trang web.
  // Dù cái nút Header có xuất hiện muộn thì nó vẫn bắt được chính xác.
  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".theme-toggle, #themeToggle");
    if (toggleBtn) {
      const currentTheme = document.body.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    }
  });
});
