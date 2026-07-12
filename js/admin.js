document.addEventListener("DOMContentLoaded", () => {
  highlightActiveMenu();

  loadAdminInformation();
});

function highlightActiveMenu() {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".admin-sidebar a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}

function loadAdminInformation() {
  const user = Storage.getCurrentUser();

  if (!user) return;

  const name = document.getElementById("adminName");

  if (name) {
    name.textContent = user.fullName;
  }

  const avatar = document.getElementById("adminAvatar");

  if (avatar && user.avatar) {
    avatar.src = user.avatar;
  }
}
