document.addEventListener("DOMContentLoaded", async () => {
  // Ép tải dữ liệu
  if (typeof DataLoader !== "undefined") {
    try {
      await DataLoader.initialize();
    } catch (e) {}
  }

  const recommendationPage = document.querySelector(
    '[data-page="recommendation"]',
  );
  if (!recommendationPage) return;

  const listContainer = document.querySelector("[data-recommendation-list]");
  const explainText = document.querySelector("[data-recommendation-explain]");

  const currentUser = Storage.getCurrentUser();
  if (!currentUser) return;

  const allBooks = Storage.getBooks() || [];
  const allBorrows = Storage.getBorrows() || [];

  // 1. Phân tích dữ liệu người dùng
  const displayName =
    currentUser.fullName || currentUser.name || currentUser.username;
  const myBorrows = allBorrows.filter((b) => b.userName === displayName);
  const myBorrowedTitles = myBorrows.map((b) => b.bookTitle);

  let recommendedBooks = [];
  let reason = "";

  // KỊCH BẢN 1: Chưa từng mượn sách (Hoặc lịch sử rỗng)
  if (myBorrows.length === 0) {
    reason =
      "Chào mừng bạn mới! Vì bạn chưa mượn cuốn nào, đây là những tựa sách thịnh hành và được đánh giá cao nhất hệ thống, rất đáng để bắt đầu.";

    // Lấy sách còn hàng, sắp xếp theo rating cao nhất và lấy 6 cuốn đầu
    recommendedBooks = [...allBooks]
      .filter((b) => b.available > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  } else {
    // KỊCH BẢN 2: Đã từng mượn sách -> Gợi ý theo chủ đề
    const borrowedBookDetails = allBooks.filter((b) =>
      myBorrowedTitles.includes(b.title),
    );

    // Phân tích thể loại nào được mượn nhiều nhất
    const categoryCount = {};
    borrowedBookDetails.forEach((b) => {
      if (b.category) {
        categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
      }
    });

    // Xếp hạng thể loại yêu thích
    const favoriteCategories = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a],
    );
    const topCategories = favoriteCategories.slice(0, 2); // Lấy 2 thể loại top đầu

    reason = `Dựa trên sở thích đọc sách thuộc chủ đề <strong>${topCategories.join(", ")}</strong> của bạn, chúng tôi đã chọn ra những tác phẩm tương đồng này.`;

    // Lọc sách: Cùng chủ đề top, chưa mượn, còn hàng
    recommendedBooks = allBooks.filter((b) => {
      const isNotBorrowed = !myBorrowedTitles.includes(b.title);
      const isAvailable = b.available > 0;
      const isMatchingCategory = topCategories.includes(b.category);
      return isNotBorrowed && isAvailable && isMatchingCategory;
    });

    // Xếp theo đánh giá
    recommendedBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Bù thêm sách nếu kết quả gợi ý bị ít (dưới 3 cuốn)
    if (recommendedBooks.length < 3) {
      const extraBooks = allBooks
        .filter((b) => b.available > 0 && !myBorrowedTitles.includes(b.title))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
      recommendedBooks = [
        ...new Set([...recommendedBooks, ...extraBooks]),
      ].slice(0, 6);
    } else {
      recommendedBooks = recommendedBooks.slice(0, 6);
    }
  }

  // Cập nhật text lý do gợi ý
  if (explainText) {
    explainText.innerHTML = reason;
    explainText.style.color = "#3b82f6";
    explainText.style.fontWeight = "500";
  }

  // ==========================================
  // NHÚNG LOGIC MƯỢN SÁCH TẠI CHỖ
  // ==========================================
  const modalHTML = `
        <div id="recomBorrowModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
            <div class="glass-card" style="width: 90%; max-width: 400px; padding: 24px; border-radius: 16px; background: var(--surface-color, #fff);">
                <h3 style="margin-bottom: 8px; font-size: 1.3rem;">Xác nhận mượn sách</h3>
                <p id="recomModalBookTitle" style="color: #3b82f6; font-weight: bold; margin-bottom: 20px;"></p>
                
                <input type="hidden" id="recomModalBookId">
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500;">Tên người mượn <span style="color:red;">*</span></label>
                    <input type="text" id="recomModalBorrowerName" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none;" value="${displayName}">
                </div>
                
                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500;">Số điện thoại</label>
                    <input type="text" id="recomModalBorrowerPhone" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none;" placeholder="Tùy chọn...">
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn--ghost" onclick="closeRecomModal()">Hủy bỏ</button>
                    <button class="btn btn--primary" onclick="confirmRecomBorrow()">Hoàn tất</button>
                </div>
            </div>
        </div>
    `;
  if (!document.getElementById("recomBorrowModal")) {
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  window.openRecomModal = function (bookId, bookTitle) {
    document.getElementById("recomModalBookId").value = bookId;
    document.getElementById("recomModalBookTitle").textContent =
      `📖 ${bookTitle}`;
    document.getElementById("recomBorrowModal").style.display = "flex";
  };

  window.closeRecomModal = function () {
    document.getElementById("recomBorrowModal").style.display = "none";
  };

  window.confirmRecomBorrow = function () {
    const bookId = document.getElementById("recomModalBookId").value;
    const bName = document
      .getElementById("recomModalBorrowerName")
      .value.trim();
    const bPhone = document
      .getElementById("recomModalBorrowerPhone")
      .value.trim();

    if (!bName) {
      alert("Vui lòng nhập tên!");
      return;
    }

    const cBooks = Storage.getBooks() || [];
    const cBorrows = Storage.getBorrows() || [];
    const cUsers = Storage.getUsers() || [];

    const bIndex = cBooks.findIndex((b) => String(b.id) === String(bookId));
    if (bIndex === -1) return;

    if (cBooks[bIndex].available <= 0) {
      showNotification("Sách đã hết!", "error");
      closeRecomModal();
      return;
    }

    cBooks[bIndex].available -= 1;
    Storage.saveBooks(cBooks);

    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);

    cBorrows.unshift({
      id: Date.now().toString(),
      bookTitle: cBooks[bIndex].title,
      userName: bName,
      phone: bPhone,
      borrowDate: today.toLocaleDateString("vi-VN"),
      dueDate: due.toLocaleDateString("vi-VN"),
      status: "Đang mượn",
    });
    Storage.saveBorrows(cBorrows);

    const uIndex = cUsers.findIndex(
      (u) => String(u.id) === String(currentUser.id),
    );
    if (uIndex !== -1) {
      cUsers[uIndex].borrowed = (cUsers[uIndex].borrowed || 0) + 1;
      Storage.saveUsers(cUsers);
      Storage.setCurrentUser(cUsers[uIndex]);
    }

    showNotification(`Mượn thành công sách gợi ý!`, "success");
    closeRecomModal();

    // Load lại trang để ẩn sách vừa mượn đi
    setTimeout(() => location.reload(), 1000);
  };

  // ==========================================
  // RENDER GIAO DIỆN
  // ==========================================
  if (!listContainer) return;

  if (recommendedBooks.length === 0) {
    listContainer.innerHTML =
      '<p class="empty-state">Hệ thống đang cập nhật sách. Vui lòng quay lại sau.</p>';
    return;
  }

  listContainer.style.display = "grid";
  listContainer.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(240px, 1fr))";
  listContainer.style.gap = "24px";
  listContainer.style.marginTop = "24px";

  listContainer.innerHTML = recommendedBooks
    .map((book) => {
      const coverImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=random&color=fff&size=300&font-size=0.3`;
      const escapedTitle = book.title
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

      return `
        <article class="glass-card hover-float" style="padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--surface-color);">
            <div style="width: 100%; height: 220px; background: #e5e7eb; border-radius: 12px; overflow: hidden; position: relative;">
                <img src="${coverImg}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.95); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #f59e0b;">
                    ⭐ ${book.rating || "4.8"}
                </span>
            </div>
            
            <div style="flex-grow: 1; margin-top: 4px;">
                <span style="font-size: 0.75rem; color: #8b5cf6; text-transform: uppercase; font-weight: 700;">${book.category || "Khác"}</span>
                <h3 style="margin: 6px 0; font-size: 1.15rem; line-height: 1.4; color: var(--text-color, #111827); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${book.title}
                </h3>
                <p style="margin: 0; font-size: 0.9rem; color: #6b7280; font-weight: 500;">Tác giả: ${book.author}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 16px; border-top: 1px dashed #e5e7eb;">
                <span style="background: #f3e8ff; color: #8b5cf6; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">
                    ${book.available} bản
                </span>
                <button class="btn btn--primary" style="background: #8b5cf6; padding: 8px 16px; font-size: 0.85rem; border-radius: 8px;" onclick="openRecomModal('${book.id}', '${escapedTitle}')">
                    Mượn ngay
                </button>
            </div>
        </article>
        `;
    })
    .join("");
});
