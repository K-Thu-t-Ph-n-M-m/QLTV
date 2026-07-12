document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("reservationList");
  const alertContainer = document.getElementById("alertList");
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) return;

  // Lấy dữ liệu đặt trước của user
  const reservations = (Storage.getReservations() || []).filter(
    (r) => r.userId === currentUser.id,
  );

  // 1. RENDER DANH SÁCH CHỜ
  if (reservations.length === 0) {
    listContainer.innerHTML = `
        <div class="hover-float" style="display: flex; flex-direction: column; align-items: center; padding: 48px 20px; background: rgba(59, 130, 246, 0.05); border-radius: 16px; text-align: center; border: 1px dashed #bfdbfe; margin-top: 16px;">
            <span style="font-size: 3rem; margin-bottom: 16px;">🕒</span>
            <h4 style="font-size: 1.1rem; color: #1e40af; font-weight: 700; margin-bottom: 8px;">Chưa có đơn đặt trước</h4>
            <p style="color: #6b7280; font-size: 0.9rem; margin-bottom: 20px;">Sách bạn cần đang có sẵn trên kệ? Hãy tìm kiếm và đặt trước nếu sách chưa về!</p>
            <button class="btn btn--ghost" onclick="window.location.href='search.html'">Tìm sách ngay</button>
        </div>
    `;
  } else {
    listContainer.innerHTML = reservations
      .map(
        (r) => `
      <div class="list-item hover-float" style="padding:16px; margin-top:12px; border-radius:12px; background:var(--surface-color); border-left: 4px solid ${r.status === "Sẵn sàng" ? "#10b981" : "#3b82f6"};">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>${r.bookTitle}</strong>
                <p style="font-size: 0.85rem; color:#6b7280; margin:4px 0;">Vị trí: ${r.queuePosition} trong hàng chờ</p>
            </div>
            <div style="text-align:right">
                <span class="status-pill" style="background:${r.status === "Sẵn sàng" ? "#d1fae5" : "#dbeafe"}; color:${r.status === "Sẵn sàng" ? "#10b981" : "#3b82f6"};">${r.status}</span>
                <button class="btn btn--ghost" style="padding:4px 8px; font-size:0.75rem; margin-left:8px;" onclick="cancelReservation('${r.id}')">Hủy</button>
            </div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  // 2. RENDER THÔNG BÁO (Tự động tạo alert nếu sách sẵn sàng)
  const readyReservations = reservations.filter((r) => r.status === "Sẵn sàng");
  if (readyReservations.length > 0) {
    alertContainer.innerHTML = readyReservations
      .map(
        (r) => `
        <div style="padding:12px; border-radius:8px; background:#fff7ed; border-left: 4px solid #f59e0b; margin-bottom:10px; font-size:0.9rem;">
            🔔 <strong>Sách đã sẵn sàng:</strong> ${r.bookTitle}. Vui lòng đến thư viện để mượn trước ngày ${r.expiryDate}.
        </div>
    `,
      )
      .join("");
  } else {
    alertContainer.innerHTML =
      '<p style="color: #6b7280; font-size: 0.9rem;">Không có thông báo mới.</p>';
  }

  // Hàm hủy đặt trước
  window.cancelReservation = function (id) {
    let reservations = Storage.getReservations();
    reservations = reservations.filter((r) => String(r.id) !== String(id));
    Storage.saveReservations(reservations);
    showNotification("Đã hủy đơn đặt trước.", "info");
    setTimeout(() => location.reload(), 1000);
  };
});
