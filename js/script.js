document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initActiveNav();
  initFaqAccordion();
  initContactForm();
  initShopCart();
});

function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("header nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
    const isOpen = nav.classList.contains("open");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.textContent = isOpen ? "\u2715" : "\u2630";
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "\u2630";
    });
  });
}

function initActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("nav a").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach(function (button) {
    button.addEventListener("click", function () {
      const item = button.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item").forEach(function (faq) {
        faq.classList.remove("open");
      });

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");
    const successMsg = document.getElementById("form-success");
    let valid = true;

    clearErrors();

    if (!name.value.trim()) {
      showError("name-error", "Please enter your name.");
      valid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      showError("email-error", "Please enter a valid email address.");
      valid = false;
    }

    if (!message.value.trim()) {
      showError("message-error", "Please enter your message.");
      valid = false;
    }

    if (valid) {
      successMsg.style.display = "block";
      form.reset();
      setTimeout(function () {
        successMsg.style.display = "none";
      }, 5000);
    }
  });
}

function showError(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
    el.style.display = "block";
  }
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach(function (el) {
    el.style.display = "none";
    el.textContent = "";
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

var cart = loadCart();

function loadCart() {
  try {
    var saved = sessionStorage.getItem("pictureThisCart");
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

function saveCart() {
  sessionStorage.setItem("pictureThisCart", JSON.stringify(cart));
}

function getCartItemCount() {
  return Object.values(cart).reduce(function (sum, item) {
    return sum + item.qty;
  }, 0);
}

function getCartTotal() {
  return Object.values(cart).reduce(function (sum, item) {
    return sum + item.price * item.qty;
  }, 0);
}

function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

function initShopCart() {
  var cartBar = document.getElementById("cart-bar");
  if (!cartBar) return;

  updateCartBadge();
  renderCartItems();

  document.querySelectorAll(".add-to-cart").forEach(function (button) {
    button.addEventListener("click", function () {
      var plantName = button.getAttribute("data-plant");
      var price = parseFloat(button.getAttribute("data-price"));

      if (cart[plantName]) {
        cart[plantName].qty++;
      } else {
        cart[plantName] = { name: plantName, price: price, qty: 1 };
      }

      saveCart();
      updateCartBadge();
      renderCartItems();

      button.textContent = "Added!";
      button.disabled = true;
      setTimeout(function () {
        button.textContent = "Add to Cart";
        button.disabled = false;
      }, 1500);

      showToast(plantName + " added to cart!");
    });
  });

  cartBar.addEventListener("click", openCartModal);
  cartBar.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCartModal();
    }
  });

  var overlay = document.getElementById("cart-overlay");
  var closeBtn = document.querySelector(".cart-close");
  var checkoutBtn = document.getElementById("checkout-btn");
  var backBtn = document.getElementById("back-to-cart-btn");
  var orderForm = document.getElementById("order-form");
  var continueBtn = document.getElementById("continue-shopping-btn");

  if (closeBtn) closeBtn.addEventListener("click", closeCartModal);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeCartModal();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      showCheckoutView();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      showCartView();
    });
  }

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      placeOrder();
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      closeCartModal();
      showCartView();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && !overlay.hidden) {
      closeCartModal();
    }
  });
}

function updateCartBadge() {
  var cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) cartCountEl.textContent = getCartItemCount();
}

function renderCartItems() {
  var cartItemsEl = document.getElementById("cart-items");
  var cartTotalEl = document.getElementById("cart-total");
  var emptyMsg = document.getElementById("cart-empty-msg");
  var checkoutBtn = document.getElementById("checkout-btn");

  if (!cartItemsEl) return;

  var items = Object.values(cart);
  cartItemsEl.innerHTML = "";

  if (items.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (cartTotalEl) cartTotalEl.textContent = "$0.00";
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (checkoutBtn) checkoutBtn.disabled = false;

  items.forEach(function (item) {
    var row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      '<div class="cart-item-info">' +
      '<span class="cart-item-name">' + item.name + "</span>" +
      '<span class="cart-item-price">' + formatPrice(item.price) + " each</span>" +
      "</div>" +
      '<div class="cart-item-controls">' +
      '<button type="button" class="qty-btn qty-minus" data-plant="' + item.name + '" aria-label="Decrease quantity">-</button>' +
      '<span class="cart-item-qty">' + item.qty + "</span>" +
      '<button type="button" class="qty-btn qty-plus" data-plant="' + item.name + '" aria-label="Increase quantity">+</button>' +
      '<button type="button" class="remove-item" data-plant="' + item.name + '" aria-label="Remove item">&times;</button>' +
      "</div>" +
      '<span class="cart-item-subtotal">' + formatPrice(item.price * item.qty) + "</span>";

    cartItemsEl.appendChild(row);
  });

  cartItemsEl.querySelectorAll(".qty-minus").forEach(function (btn) {
    btn.addEventListener("click", function () {
      changeQty(btn.getAttribute("data-plant"), -1);
    });
  });

  cartItemsEl.querySelectorAll(".qty-plus").forEach(function (btn) {
    btn.addEventListener("click", function () {
      changeQty(btn.getAttribute("data-plant"), 1);
    });
  });

  cartItemsEl.querySelectorAll(".remove-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      removeFromCart(btn.getAttribute("data-plant"));
    });
  });

  if (cartTotalEl) cartTotalEl.textContent = formatPrice(getCartTotal());
}

function changeQty(plantName, delta) {
  if (!cart[plantName]) return;

  cart[plantName].qty += delta;

  if (cart[plantName].qty <= 0) {
    delete cart[plantName];
  }

  saveCart();
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(plantName) {
  delete cart[plantName];
  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast(plantName + " removed from cart.");
}

function openCartModal() {
  var overlay = document.getElementById("cart-overlay");
  if (!overlay) return;

  renderCartItems();
  showCartView();
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCartModal() {
  var overlay = document.getElementById("cart-overlay");
  if (!overlay) return;

  overlay.hidden = true;
  document.body.style.overflow = "";
}

function showCartView() {
  document.getElementById("cart-view").hidden = false;
  document.getElementById("checkout-view").hidden = true;
  document.getElementById("order-success-view").hidden = true;
}

function showCheckoutView() {
  if (getCartItemCount() === 0) {
    showToast("Add plants to your cart before checking out.");
    return;
  }

  document.getElementById("cart-view").hidden = true;
  document.getElementById("checkout-view").hidden = false;
  document.getElementById("order-success-view").hidden = true;
}

function showOrderSuccess(orderNumber, summary) {
  document.getElementById("cart-view").hidden = true;
  document.getElementById("checkout-view").hidden = true;
  document.getElementById("order-success-view").hidden = false;
  document.getElementById("order-number").textContent = orderNumber;
  document.getElementById("order-summary-text").textContent = summary;
}

function clearOrderErrors() {
  ["order-name", "order-email", "order-phone", "order-address", "order-city", "order-zip"].forEach(function (field) {
    showError(field + "-error", "");
    var el = document.getElementById(field + "-error");
    if (el) el.style.display = "none";
  });
}

function placeOrder() {
  clearOrderErrors();

  var name = document.getElementById("order-name");
  var email = document.getElementById("order-email");
  var phone = document.getElementById("order-phone");
  var address = document.getElementById("order-address");
  var city = document.getElementById("order-city");
  var zip = document.getElementById("order-zip");
  var valid = true;

  if (!name.value.trim()) {
    showError("order-name-error", "Please enter your name.");
    valid = false;
  }

  if (!email.value.trim() || !isValidEmail(email.value)) {
    showError("order-email-error", "Please enter a valid email.");
    valid = false;
  }

  if (!phone.value.trim()) {
    showError("order-phone-error", "Please enter your phone number.");
    valid = false;
  }

  if (!address.value.trim()) {
    showError("order-address-error", "Please enter your delivery address.");
    valid = false;
  }

  if (!city.value.trim()) {
    showError("order-city-error", "Please enter your city.");
    valid = false;
  }

  if (!zip.value.trim()) {
    showError("order-zip-error", "Please enter your ZIP code.");
    valid = false;
  }

  if (!valid) return;

  var orderNumber = "PT-" + Date.now().toString().slice(-8);
  var itemList = Object.values(cart)
    .map(function (item) {
      return item.qty + "x " + item.name;
    })
    .join(", ");
  var total = formatPrice(getCartTotal());
  var summary =
    "Hi " + name.value.trim() + ", we are preparing " + itemList + " for delivery to " +
    address.value.trim() + ", " + city.value.trim() + " " + zip.value.trim() +
    ". Total charged: " + total + ". A confirmation will be sent to " + email.value.trim() + ".";

  cart = {};
  saveCart();
  updateCartBadge();
  renderCartItems();
  document.getElementById("order-form").reset();

  showOrderSuccess(orderNumber, summary);
  showToast("Order placed successfully!");
}

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText =
      "position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);background:#2d5a3d;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;z-index:200;transition:opacity 0.3s;font-size:0.95rem;";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.style.opacity = "0";
  }, 2500);
}
