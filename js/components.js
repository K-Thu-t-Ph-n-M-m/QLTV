document.addEventListener("DOMContentLoaded", () => {
  loadComponents();
});

async function loadComponents() {
  const components = [
    {
      id: "admin-header",
      file: "../components/adminHeader.html",
    },
    {
      id: "admin-sidebar",
      file: "../components/adminSidebar.html",
    },
    {
      id: "admin-footer",
      file: "../components/adminFooter.html",
    },
    {
      id: "site-header",
      file: "components/header.html",
    },
    {
      id: "site-footer",
      file: "components/footer.html",
    },
  ];

  for (const component of components) {
    await loadComponent(component.id, component.file);
  }
}

async function loadComponent(id, file) {
  const container = document.getElementById(id);

  if (!container) return;

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(file);
    }

    container.innerHTML = await response.text();
  } catch (error) {
    console.error("Không thể tải:", file);
  }
}
