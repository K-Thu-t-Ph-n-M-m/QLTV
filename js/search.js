document.addEventListener("DOMContentLoaded", async () => {
  if (typeof DataLoader !== "undefined") {
    try {
      await DataLoader.initialize();
    } catch (e) {}
  }

  const searchInput = document.querySelector("[data-search-input]");
  const searchBtn = document.querySelector("[data-search-button]");
  const categoriesContainer = document.querySelector(
    "[data-search-categories]",
  );
  const sortSelect = document.querySelector("[data-search-sort]");
  const resultsContainer = document.querySelector("[data-search-results]");
  const summaryText = document.querySelector("[data-search-summary]");

  let currentCategory = "Tất cả";
  let searchTerm = "";
  let currentSort = "default";

  function getCategories() {
    const books = Storage.getBooks() || [];
    const unique = [...new Set(books.map((b) => b.category).filter(Boolean))];
    return ["Tất cả", ...unique];
  }

  function renderCategories() {
    if (!categoriesContainer) return;
    const categories = getCategories();
    categoriesContainer.innerHTML = categories
      .map(
        (cat) => `
            <button class="chip ${cat === currentCategory ? "active" : ""}" data-cat="${cat}">
                ${cat}
            </button>
        `,
      )
      .join("");

    categoriesContainer.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        currentCategory = e.target.getAttribute("data-cat");
        renderCategories();
        applyFilters();
      });
    });
  }

  function applyFilters() {
    let filtered = Storage.getBooks() || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const removeAccents = (str) =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const termNoAccent = removeAccents(term);

      filtered = filtered.filter((b) => {
        const title = b.title ? b.title.toLowerCase() : "";
        const author = b.author ? b.author.toLowerCase() : "";
        const isbn = b.isbn ? b.isbn.toLowerCase() : "";

        return (
          title.includes(term) ||
          author.includes(term) ||
          isbn.includes(term) ||
          removeAccents(title).includes(termNoAccent) ||
          removeAccents(author).includes(termNoAccent)
        );
      });
    }

    if (currentCategory !== "Tất cả") {
      filtered = filtered.filter((b) => b.category === currentCategory);
    }

    if (currentSort === "availability") {
      filtered.sort((a, b) => (b.available || 0) - (a.available || 0));
    } else if (currentSort === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    renderBooks(filtered);
  }

  const modalHTML = `
        <div id="borrowModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
            <div class="glass-card" style="width: 90%; max-width: 400px; padding: 24px; border-radius: 16px; background: var(--surface-color, #fff);">
                <h3 style="margin-bottom: 8px; font-size: 1.3rem;">Xác nhận mượn sách</h3>
                <p id="modalBookTitle" style="color: #3b82f6; font-weight: bold; margin-bottom: 20px;"></p>
                
                <input type="hidden" id="modalBookId">
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500;">Tên người mượn <span style="color:red;">*</span></label>
                    <input type="text" id="modalBorrowerName" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none;" placeholder="Nhập họ tên...">
                </div>
                
                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500;">Số điện thoại / Mã thẻ</label>
                    <input type="text" id="modalBorrowerPhone" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; outline: none;" placeholder="Tùy chọn...">
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn--ghost" onclick="closeBorrowModal()">Hủy bỏ</button>
                    <button class="btn btn--primary" onclick="confirmBorrow()">Hoàn tất mượn</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  window.openBorrowModal = function (bookId, bookTitle) {
    const currentUser = Storage.getCurrentUser();
    if (!currentUser) {
      showNotification("Vui lòng đăng nhập trước khi mượn sách!", "warning");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }

    document.getElementById("modalBookId").value = bookId;
    document.getElementById("modalBookTitle").textContent = `📖 ${bookTitle}`;

    const displayName =
      currentUser.fullName || currentUser.name || currentUser.username || "";
    document.getElementById("modalBorrowerName").value = displayName;

    document.getElementById("borrowModal").style.display = "flex";
  };

  window.closeBorrowModal = function () {
    document.getElementById("borrowModal").style.display = "none";
  };

  window.confirmBorrow = function () {
    const bookId = document.getElementById("modalBookId").value;
    const borrowerName = document
      .getElementById("modalBorrowerName")
      .value.trim();
    const borrowerPhone = document
      .getElementById("modalBorrowerPhone")
      .value.trim();

    if (!borrowerName) {
      alert("Vui lòng nhập tên người mượn!");
      return;
    }

    const currentBooks = Storage.getBooks() || [];
    const borrows = Storage.getBorrows() || [];
    const users = Storage.getUsers() || [];
    const currentUser = Storage.getCurrentUser();

    const bookIndex = currentBooks.findIndex(
      (b) => String(b.id) === String(bookId),
    );
    if (bookIndex === -1) return;

    const book = currentBooks[bookIndex];
    if (book.available <= 0) {
      showNotification("Sách đã hết bản có sẵn!", "error");
      closeBorrowModal();
      return;
    }

    // 1. Trừ kho sách
    book.available -= 1;
    currentBooks[bookIndex] = book;
    Storage.saveBooks(currentBooks);

    // 2. Tạo phiếu mượn
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);

    borrows.unshift({
      id: Date.now().toString(),
      bookTitle: book.title,
      userName: borrowerName,
      phone: borrowerPhone,
      borrowDate: today.toLocaleDateString("vi-VN"),
      dueDate: due.toLocaleDateString("vi-VN"),
      status: "Đang mượn",
    });
    Storage.saveBorrows(borrows);

    // 3. Cập nhật user
    if (currentUser) {
      const userIndex = users.findIndex(
        (u) => String(u.id) === String(currentUser.id),
      );
      if (userIndex !== -1) {
        users[userIndex].borrowed = (users[userIndex].borrowed || 0) + 1;
        Storage.saveUsers(users);
        Storage.setCurrentUser(users[userIndex]);
      }
    }

    showNotification(`Đã tạo phiếu mượn cho "${borrowerName}"!`, "success");
    closeBorrowModal();
    applyFilters(); // Bắt buộc render lại giao diện để ẩn sách vừa mượn
  };

  function renderBooks(booksToRender) {
    if (!resultsContainer) return;

    // BƯỚC LỌC THÔNG MINH MỚI
    const currentUser = Storage.getCurrentUser();
    const borrows = Storage.getBorrows() || [];
    let borrowedTitles = [];

    if (currentUser) {
      // Lấy tên định danh của user đang đăng nhập
      const displayName =
        currentUser.fullName || currentUser.name || currentUser.username;
      // Tìm tất cả các sách mà người này đang mượn (chưa trả)
      borrowedTitles = borrows
        .filter((b) => b.userName === displayName && b.status !== "Đã trả")
        .map((b) => b.bookTitle);
    }

    // Lọc ra các sách: CÒN HÀNG (available > 0) VÀ CHƯA BỊ MƯỢN BỞI USER NÀY
    const availableBooksOnly = booksToRender.filter((b) => {
      const hasStock = b.available > 0;
      const notBorrowedYet = !borrowedTitles.includes(b.title);
      return hasStock && notBorrowedYet;
    });

    if (availableBooksOnly.length === 0) {
      resultsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;" class="glass-card">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📭</div>
                    <h3 style="color: var(--text-color, #111827); margin-bottom: 8px;">Không tìm thấy sách</h3>
                    <p style="color: #6b7280;">Bạn đã mượn cuốn này hoặc sách hiện không có sẵn.</p>
                </div>
            `;
      if (summaryText) summaryText.textContent = `Không tìm thấy kết quả nào.`;
      resultsContainer.style.display = "block";
      return;
    }

    if (summaryText) {
      summaryText.textContent = searchTerm
        ? `Tìm thấy ${availableBooksOnly.length} sách cho từ khóa "${searchTerm}"`
        : `Đang hiển thị ${availableBooksOnly.length} cuốn sách sẵn có`;
    }

    resultsContainer.style.display = "grid";
    resultsContainer.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(260px, 1fr))";
    resultsContainer.style.gap = "24px";

    resultsContainer.innerHTML = availableBooksOnly
      .map((book) => {
        const coverImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=random&color=fff&size=300&font-size=0.3`;
        const escapedTitle = book.title
          .replace(/'/g, "\\'")
          .replace(/"/g, "&quot;");

        return `
            <article class="glass-card hover-float" style="padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;">
                <div style="width: 100%; height: 220px; background: #e5e7eb; border-radius: 12px; overflow: hidden; position: relative;">
                    <img src="${coverImg}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <span style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.95); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #f59e0b;">
                        ⭐ ${book.rating || "4.8"}
                    </span>
                </div>
                
                <div style="flex-grow: 1; margin-top: 4px;">
                    <span style="font-size: 0.75rem; color: #3b82f6; text-transform: uppercase; font-weight: 700;">${book.category || "Khác"}</span>
                    <h3 style="margin: 6px 0; font-size: 1.15rem; line-height: 1.4; color: var(--text-color, #111827); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${book.title}
                    </h3>
                    <p style="margin: 0; font-size: 0.9rem; color: #6b7280; font-weight: 500;">Tác giả: ${book.author}</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 16px; border-top: 1px dashed #e5e7eb;">
                    <span style="background: #d1fae5; color: #10b981; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">
                        Sẵn có: ${book.available}
                    </span>
                    <button class="btn btn--primary" style="padding: 8px 16px; font-size: 0.85rem; border-radius: 8px;" onclick="openBorrowModal('${book.id}', '${escapedTitle}')">
                        Mượn ngay
                    </button>
                </div>
            </article>
            `;
      })
      .join("");
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      searchTerm = searchInput.value;
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  renderCategories();
  applyFilters();
});
