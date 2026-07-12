document.addEventListener("DOMContentLoaded", () => {
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) return;

  const allBorrows = Storage.getBorrows() || [];
  const currentUserName =
    currentUser.name || currentUser.fullName || currentUser.username;
  const myBorrows = allBorrows.filter((b) => b.userName === currentUserName);
  const activeBorrows = myBorrows.filter((b) => b.status !== "Đã trả");
  const historyBorrows = myBorrows.filter((b) => b.status === "Đã trả");

  const activeContainer = document.querySelector("[data-borrowed-list]");
  const historyContainer = document.querySelector("[data-history-list]");

  // Hàm trả sách
  window.returnBook = function (borrowId) {
    const borrows = Storage.getBorrows() || [];
    const books = Storage.getBooks() || [];
    const borrowIndex = borrows.findIndex(
      (b) => String(b.id) === String(borrowId),
    );
    if (borrowIndex === -1) return;

    const borrow = borrows[borrowIndex];
    const bookIndex = books.findIndex((b) => b.title === borrow.bookTitle);
    if (bookIndex !== -1) {
      books[bookIndex].available += 1;
      Storage.saveBooks(books);
    }

    borrows[borrowIndex].status = "Đã trả";
    Storage.saveBorrows(borrows);
    showNotification(`Đã trả sách "${borrow.bookTitle}"!`, "success");
    setTimeout(() => location.reload(), 1000);
  };

  // 1. Render Sách đang mượn (có slogan giữ chỗ)
  if (activeContainer) {
    if (activeBorrows.length === 0) {
      activeContainer.innerHTML = `
                <div class="hover-float" style="display: flex; flex-direction: column; align-items: center; padding: 60px 24px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%); border-radius: 16px; text-align: center; border: 1px dashed rgba(59, 130, 246, 0.3); margin-top: 16px;">
                    <span style="font-size: 3.5rem; margin-bottom: 16px;">📚</span>
                    <h4 style="font-size: 1.25rem; color: #1e40af; margin-bottom: 12px; font-weight: 800;">Hành trang tri thức đang chờ mở khóa</h4>
                    <p style="color: #6b7280; margin-bottom: 24px; max-width: 85%;">Bạn chưa mượn cuốn sách nào. Hãy chọn cho mình một tác phẩm ưng ý để bắt đầu hành trình!</p>
                    <button class="btn btn--primary" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 25px; padding: 12px 28px;" onclick="window.location.href='search.html'">Khám phá ngay</button>
                </div>
            `;
    } else {
      activeContainer.innerHTML = activeBorrows
        .map(
          (b) => `
                <div class="list-item hover-float" style="display:flex; justify-content:space-between; align-items:center; padding:16px; margin-top:12px; border-radius: 12px; border-left: 4px solid #3b82f6; background: var(--surface-color); box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                    <div>
                        <strong style="font-size: 1.1rem;">${b.bookTitle}</strong>
                        <p style="font-size: 0.85rem; color:#6b7280; margin:4px 0;">Hạn: <span style="color:#ef4444; font-weight:bold;">${b.dueDate}</span></p>
                    </div>
                    <button class="btn btn--primary" style="padding:6px 12px; font-size:0.8rem;" onclick="returnBook('${b.id}')">Trả sách</button>
                </div>
            `,
        )
        .join("");
    }
  }

  // 2. Render Lịch sử đã trả (có dấu chân thời gian)
  if (historyContainer) {
    if (historyBorrows.length === 0) {
      historyContainer.innerHTML = `
                <div class="hover-float" style="display: flex; flex-direction: column; align-items: center; padding: 60px 20px; background: rgba(0,0,0,0.02); border-radius: 16px; text-align: center; margin-top: 16px;">
                    <span style="font-size: 2.8rem; margin-bottom: 16px; opacity: 0.6;">⏳</span>
                    <h4 style="font-size: 1.15rem; color: #4b5563; font-weight: 700;">Chưa có dấu chân thời gian</h4>
                    <p style="color: #9ca3af; font-size: 0.95rem;">Những cuốn sách đã đọc xong sẽ lưu niệm tại đây.</p>
                </div>
            `;
    } else {
      historyContainer.innerHTML = historyBorrows
        .map(
          (b) => `
                <div class="list-item hover-float" style="padding:16px; margin-top:12px; border-radius: 12px; border-left: 4px solid #10b981; background: var(--surface-color); opacity: 0.8;">
                    <strong style="text-decoration:line-through;">${b.bookTitle}</strong>
                    <span style="float:right; color:#10b981; font-size:0.85rem; font-weight:600;">Đã hoàn tất</span>
                </div>
            `,
        )
        .join("");
    }
  }
});
