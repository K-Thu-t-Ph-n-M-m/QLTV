document.addEventListener("DOMContentLoaded", () => {
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) return;

  // 1. DỮ LIỆU THẬT TỪ STORAGE
  const allBorrows = Storage.getBorrows() || [];
  const currentUserName =
    currentUser.name || currentUser.fullName || currentUser.username;
  const myBorrows = allBorrows.filter((b) => b.userName === currentUserName);

  // 2. RENDER BIẾN ĐỘNG GẦN ĐÂY
  const recentList = document.querySelector(".timeline-list");
  if (recentList) {
    if (myBorrows.length === 0) {
      recentList.innerHTML =
        '<li style="color:#6b7280; font-style:italic;">Chưa có hoạt động mượn sách nào.</li>';
    } else {
      const sortedBorrows = [...myBorrows].reverse().slice(0, 5);
      recentList.innerHTML = sortedBorrows
        .map(
          (b) => `
        <li>Đã mượn <strong>${b.bookTitle}</strong> - ${b.borrowDate}</li>
      `,
        )
        .join("");
    }
  }

  // 3. THỐNG KÊ NHANH & CSS TRỰC TIẾP
  const activeCount = myBorrows.filter((b) => b.status !== "Đã trả").length;
  const historyCount = myBorrows.filter((b) => b.status === "Đã trả").length;

  const statBoxes = document.querySelectorAll(".stat-box");
  const statValues = document.querySelectorAll(".stat-box strong");

  if (statValues.length >= 3) {
    statValues[0].textContent = historyCount; // Sách đã đọc
    statValues[1].textContent = activeCount; // Đang mượn
    statValues[2].textContent = "0"; // Đặt trước
  }

  // CSS TRỰC TIẾP CHO THỐNG KÊ NHANH
  statBoxes.forEach((box, index) => {
    box.style.cssText = `
        padding: 15px;
        border-radius: 12px;
        background: rgba(59, 130, 246, 0.05);
        border: 1px solid rgba(59, 130, 246, 0.1);
        text-align: center;
        flex: 1;
        transition: transform 0.2s;
    `;
    box.onmouseover = () => (box.style.transform = "translateY(-5px)");
    box.onmouseout = () => (box.style.transform = "translateY(0)");
  });

  // 4. THÔNG TIN CÁ NHÂN & NGÀY THAM GIA
  const profileSpans = document.querySelectorAll(".profile-row span");
  if (profileSpans.length >= 4) {
    profileSpans[0].textContent = currentUserName;
    profileSpans[1].textContent = currentUser.email;
    profileSpans[2].textContent =
      currentUser.role === "admin" ? "Quản trị viên" : "Độc giả";
    if (currentUser.createdAt) {
      const joinDate = new Date(currentUser.createdAt);
      profileSpans[3].textContent = joinDate.toLocaleDateString("vi-VN");
    }
  }

  // 5. CSS TRỰC TIẾP CHO FORM ĐỔI MẬT KHẨU
  // Tìm form đổi mật khẩu dựa trên cấu trúc trang
  const passwordSection =
    document.querySelector('.card-panel:has(input[type="password"])') ||
    document.querySelector("form");
  if (passwordSection) {
    const inputs = passwordSection.querySelectorAll('input[type="password"]');
    const button = passwordSection.querySelector("button");

    passwordSection.style.cssText =
      "padding: 24px; border-radius: 16px; background: var(--surface-color);";

    inputs.forEach((input) => {
      input.style.cssText = `
              width: 100%;
              padding: 12px 16px;
              margin-bottom: 10px;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              background: #f9fafb;
              outline: none;
          `;
    });

    if (button) {
      button.style.cssText = `
              width: 100%;
              padding: 12px;
              border-radius: 10px;
              background: linear-gradient(135deg, #3b82f6, #6366f1);
              color: white;
              font-weight: 600;
              border: none;
              cursor: pointer;
              margin-top: 10px;
          `;
    }
  }
});
