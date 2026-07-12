const notificationContainer = document.getElementById("notificationContainer");

function showNotification(message, type = "success", duration = 3000) {
  if (!notificationContainer) return;

  const icons = {
    success: `
        <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor"
            d="M9.5 16.2L5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/>
        </svg>`,

    error: `
        <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor"
            d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/>
        </svg>`,

    warning: `
        <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor"
            d="M1 21h22L12 2 1 21zm12-3h-2v2h2zm0-8h-2v6h2z"/>
        </svg>`,

    info: `
        <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor"
            d="M11 17h2v-6h-2zm0-8h2v2h-2zm1-7C5.9 2 1 6.9 1 13s4.9 11 11 11 11-4.9 11-11S18.1 2 12 2z"/>
        </svg>`,
  };

  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;

  toast.innerHTML = `

        <div class="toast-icon">

            ${icons[type]}

        </div>

        <div class="toast-message">

            ${message}

        </div>

        <button class="toast-close">

            ✕

        </button>

        <div class="toast-progress"></div>

    `;

  notificationContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  const close = () => {
    toast.classList.remove("show");

    toast.classList.add("hide");

    setTimeout(() => {
      toast.remove();
    }, 300);
  };

  toast.querySelector(".toast-close").addEventListener("click", close);

  setTimeout(close, duration);
}
