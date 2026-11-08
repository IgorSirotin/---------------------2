function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function validateQuantity(value) {
  return /^[1-9]\d*$/.test(String(value).trim());
}

function handleMenuClick(event) {
  const button = event.currentTarget;
  const menu = button.nextElementSibling;
  const isExpanded = button.getAttribute("aria-expanded") === "true";

  button.setAttribute("aria-expanded", String(!isExpanded));
  menu.hidden = isExpanded;
}

function handleDocumentClick(event) {
  if (event.target.closest(".nav-dropdown")) return;

  document.querySelectorAll(".dropdown-toggle").forEach(function (button) {
    button.setAttribute("aria-expanded", "false");
    button.nextElementSibling.hidden = true;
  });
}

function handleEscapeKey(event) {
  if (event.key !== "Escape") return;

  document.querySelectorAll(".dropdown-toggle").forEach(function (button) {
    button.setAttribute("aria-expanded", "false");
    button.nextElementSibling.hidden = true;
  });
}

function handleImageMouseover(event) {
  const image = event.currentTarget;
  if (!image.dataset.hoverSrc || image.dataset.originalSrc) return;

  image.dataset.originalSrc = image.getAttribute("src");
  image.style.opacity = "0.6";
  image.src = image.dataset.hoverSrc;
  image.onload = function () {
    image.style.opacity = "1";
  };
}

function handleImageMouseout(event) {
  const image = event.currentTarget;
  if (!image.dataset.originalSrc) return;

  image.src = image.dataset.originalSrc;
  image.style.opacity = "1";
  delete image.dataset.originalSrc;
}

function handleFieldFocus(event) {
  const row = event.target.closest(".form-row");
  if (row) row.classList.add("is-focused");
}

function handleFieldBlur(event) {
  const row = event.target.closest(".form-row");
  if (row) row.classList.remove("is-focused");
  handleOrderInput(event);
}

function handleOrderInput(event) {
  const field = event.target;
  if (!["customer-name", "customer-email", "quantity"].includes(field.id)) return;

  const value = String(field.value).trim();
  let valid = value.length > 0;

  if (field.id === "customer-name") valid = value.length >= 2;
  if (field.id === "customer-email") valid = validateEmail(value);
  if (field.id === "quantity") valid = validateQuantity(value);

  field.setAttribute("aria-invalid", String(!valid));
}

function updateProductHint(select) {
  const option = select.options[select.selectedIndex];
  const hint = document.getElementById("product-hint");
  if (!hint) return;

  hint.textContent = option.dataset.price ? "Цена: " + option.dataset.price : "Выберите изделие, чтобы увидеть цену.";
}

function handleProductChange(event) {
  updateProductHint(event.target);
}

function handleOrderSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const name = String(form.elements.namedItem("Имя").value).trim();
  const email = String(form.elements.namedItem("Почта").value).trim();
  const quantity = String(form.elements.namedItem("Количество").value).trim();
  const consent = form.elements.namedItem("Согласие").checked;
  const errors = [];

  if (name.length < 2) errors.push("Введите имя (не менее двух символов).");
  if (!validateEmail(email)) errors.push("Проверьте адрес электронной почты.");
  if (!validateQuantity(quantity)) errors.push("Количество должно быть целым числом больше нуля.");
  if (!consent) errors.push("Подтвердите согласие на обработку данных.");

  const status = document.getElementById("form-status");
  status.textContent = errors.length ? errors.join(" ") : "Данные проверены. Заявка готова к отправке.";
  status.classList.toggle("form-error", errors.length > 0);

  if (!errors.length) form.reset();
}

function handleRandomPick() {
  const cards = Array.from(document.querySelectorAll(".product-card[data-kind='featured']"));
  if (!cards.length) return;

  cards.forEach(function (card) {
    card.classList.remove("is-selected");
  });

  const selectedCard = cards[Math.floor(Math.random() * cards.length)];
  selectedCard.classList.add("is-selected");
  document.getElementById("featured-status").textContent = "Случайный выбор: " + selectedCard.querySelector("h3").textContent;
}

function updateClock() {
  const clock = document.getElementById("live-clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString("ru-RU");
}

function selectRequestedProduct() {
  const select = document.getElementById("product");
  if (!select) return;

  const items = {
    cup: "Кружка «Утро»",
    vase: "Ваза «Течение»",
    plate: "Тарелка «Берег»",
    bowl: "Пиала «Соль»"
  };
  const requestedItem = new URLSearchParams(window.location.search).get("item");

  if (items[requestedItem]) select.value = items[requestedItem];
  updateProductHint(select);
}

function initializeInteractions() {
  document.querySelectorAll(".dropdown-toggle").forEach(function (button) {
    button.addEventListener("click", handleMenuClick);
  });
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleEscapeKey);
  document.querySelectorAll(".product-image-link img").forEach(function (image) {
    image.addEventListener("mouseover", handleImageMouseover);
    image.addEventListener("mouseout", handleImageMouseout);
  });
  document.addEventListener("focusin", handleFieldFocus);
  document.addEventListener("focusout", handleFieldBlur);

  const randomButton = document.getElementById("random-pick");
  if (randomButton) randomButton.addEventListener("click", handleRandomPick);

  document.querySelectorAll(".order-form").forEach(function (form) {
    form.addEventListener("input", handleOrderInput);
    form.addEventListener("change", function (event) {
      if (event.target.id === "product") handleProductChange(event);
    });
    form.addEventListener("submit", handleOrderSubmit);
  });

  updateClock();
  window.setInterval(updateClock, 1000);
  selectRequestedProduct();
}

document.addEventListener("DOMContentLoaded", initializeInteractions);