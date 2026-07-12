document.addEventListener("DOMContentLoaded", () => {
  const reportPage = document.querySelector('[data-page="report"]');
  if (!reportPage) return;

  const books = Storage.getBooks() || [];
  const users = Storage.getUsers() || [];
  const borrows = Storage.getBorrows() || [];

  // 1. TÍNH TOÁN DỮ LIỆU TỔNG QUAN (THẺ THỐNG KÊ NHANH)
  const totalBooks = books.length;
  const totalUsers = users.length;
  const today = new Date().toLocaleDateString("vi-VN");
  const borrowsToday = borrows.filter((b) => b.borrowDate === today).length;

  // Giả định tiền phạt: mỗi phiếu mượn (nếu quá hạn) trung bình là 10.000đ (demo)
  const totalRevenue =
    borrows.filter((b) => b.status === "Đã trả").length * 10000;

  // Cập nhật giá trị vào HTML
  const updateCard = (selector, value, prefix = "") => {
    const el = document.querySelector(`[data-counter="${selector}"]`);
    if (el) {
      el.dataset.counter = value;
      el.textContent = `${prefix}${value.toLocaleString("vi-VN")}`;
    }
  };

  updateCard("1284", totalBooks);
  updateCard("842", totalUsers);
  updateCard("156", borrowsToday);
  updateCard("245800000", totalRevenue, "₫ ");

  // 2. BIỂU ĐỒ SỐ LƯỢT MƯỢN THEO THÁNG
  const monthlyData = {};
  borrows.forEach((b) => {
    const month = b.borrowDate.split("/")[1]; // Lấy tháng từ DD/MM/YYYY
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const barChart = document.getElementById("monthlyBorrowChart");
  if (barChart) {
    barChart.innerHTML = Object.keys(monthlyData)
      .map(
        (m) => `
      <div class="bar-chart__item">
        <div class="bar-chart__bar" style="height:${Math.min(monthlyData[m] * 20, 100)}%"></div>
        <span class="bar-chart__label">Thg ${m}</span>
      </div>
    `,
      )
      .join("");
  }

  // 3. BIỂU ĐỒ TỶ LỆ THỂ LOẠI (Dựa trên sách trong kho)
  const categoryStats = {};
  books.forEach((b) => {
    const cat = b.category || "Khác";
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const categoryWrap = document.getElementById("categoryRatioChart"); // Giả sử dùng ID này hoặc thay bằng logic render cũ
  // Logic cũ của bạn dùng donut-chart-wrap, ta sẽ render lại dựa trên categoryStats

  // 4. TOP SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT
  const bookFrequency = {};
  borrows.forEach((b) => {
    bookFrequency[b.bookTitle] = (bookFrequency[b.bookTitle] || 0) + 1;
  });

  const sortedBooks = Object.keys(bookFrequency)
    .sort((a, b) => bookFrequency[b] - bookFrequency[a])
    .slice(0, 5);

  const topBooksContainer = document.getElementById("topBooksChart");
  if (topBooksContainer) {
    topBooksContainer.innerHTML = sortedBooks
      .map(
        (title) => `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size: 0.9rem;">
        <span>${title}</span>
        <span style="font-weight:bold;">${bookFrequency[title]} lượt</span>
      </div>
    `,
      )
      .join("");
  }

  // Giữ lại hiệu ứng animation cũ
  const counterElements = document.querySelectorAll("[data-counter]");
  counterElements.forEach((element) => {
    // Chỉ cần hiển thị giá trị thật
    element.textContent = element.dataset.prefix
      ? element.dataset.prefix +
        Number(element.dataset.counter).toLocaleString("vi-VN")
      : Number(element.dataset.counter).toLocaleString("vi-VN");
  });
});
