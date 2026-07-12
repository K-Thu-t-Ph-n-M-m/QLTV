document.addEventListener("DOMContentLoaded", () => {
  const supplierPage = document.querySelector('[data-page="supplier"]');
  if (!supplierPage) return;

  const partnerList = document.querySelector("[data-partner-list]");
  const historyList = document.querySelector("[data-history-list]");

  // Lấy dữ liệu nhà cung cấp thật từ Storage thay vì gõ cứng danh sách[cite: 30, 31]
  const partners = Storage.getSuppliers();

  const history = [
    "Nhập 80 quyển sách công nghệ - 02/07",
    "Nhập 45 quyển sách kinh doanh - 05/07",
    "Nhập 30 quyển sách nghệ thuật - 08/07",
  ];

  if (partnerList) {
    if (!partners || partners.length === 0) {
      partnerList.innerHTML =
        '<p class="empty-state">Chưa có dữ liệu nhà cung cấp.</p>';
    } else {
      partnerList.innerHTML = partners
        .map((partner) => {
          const statusClass =
            partner.status === "Đang hợp tác" ? "active" : "warning";
          return `
                <div class="list-item">
                  <div>
                    <strong>${partner.name}</strong>
                    <p>${partner.booksDelivered || 0} đầu sách đã giao</p>
                    <p><small>${partner.contact || "Chưa cập nhật"}</small></p>
                  </div>
                  <span class="status-pill ${statusClass}">${partner.status || "Chưa rõ"}</span>
                </div>
              `;
        })
        .join("");
    }
  }

  if (historyList) {
    historyList.innerHTML = history.map((item) => `<li>${item}</li>`).join("");
  }
});
