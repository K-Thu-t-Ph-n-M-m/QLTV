document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});

async function initializeApplication() {
  initializeBackToTop();
  initializeTheme();
  await initializeBooks();
  await initializeSuppliers();
  // Đã xóa initializeDefaultAdmin() ở đây để tránh xung đột
  renderFeaturedBooks();
}

function initializeBackToTop() {
  const button = document.getElementById("backToTop");
  if (!button) return;

  const toggleButton = () => {
    button.style.display = window.scrollY > 400 ? "grid" : "none";
  };

  toggleButton();

  window.addEventListener("scroll", toggleButton, {
    passive: true,
  });

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initializeTheme() {
  if (typeof applyTheme === "function") {
    applyTheme(Storage.getTheme());
  }
}

async function initializeBooks() {
  if (Storage.getBooks().length > 0) return;

  try {
    const response = await fetch("data/books.json");
    const books = await response.json();
    Storage.saveBooks(books);
  } catch (error) {
    console.error(error);
  }
}

async function initializeSuppliers() {
  if (Storage.getSuppliers().length > 0) return;

  try {
    const response = await fetch("data/suppliers.json");
    const suppliers = await response.json();
    Storage.saveSuppliers(suppliers);
  } catch (error) {
    console.error(error);
  }
}

function renderFeaturedBooks() {
  const container = document.getElementById("featuredBooksGrid");
  if (!container) return;

  const books = Storage.getBooks();
  const featured = books.filter((book) => book.featured).slice(0, 6);

  container.innerHTML = featured
    .map(
      (book) => `
        <article class="book-card glass-card">
            <div class="book-card__image"
                 style="background-image:url('${book.image || ""}')">
            </div>
            <h3>${book.title}</h3>
            <div class="book-card__meta">
                <span>${book.author}</span>
                <span>★ ${book.rating ?? 5}</span>
            </div>
            <p>${book.category}</p>
        </article>
    `,
    )
    .join("");
}

console.log("Hệ thống Thư viện thông minh đã khởi động.");
