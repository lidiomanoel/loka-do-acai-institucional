(() => {
  const regions = {
    recife: "Recife e Região Metropolitana",
    agreste: "Agreste",
    sertao: "Sertão",
    mata: "Zona da Mata",
    outra: "Outra região de Pernambuco"
  };
  const products = [
    {id:"familia-1kg",name:"Açaí família 1 kg",category:"promo",description:"1 kg para dividir. Escolha açaí, creme ou sorvete e monte com seus acompanhamentos.",price:49.99,oldPrice:59.99,discount:"17%",image:"assets/sorvete-na-chapa.png"},
    {id:"barca-800",name:"Barca 800 ml",category:"promo",description:"Uma barca cheia de açaí, cremes e acompanhamentos para compartilhar.",price:47.99,oldPrice:54.99,discount:"13%",image:"assets/creme-no-copo.png"},
    {id:"pote-300",name:"Pote 300 ml",category:"pot",description:"Açaí, creme ou sorvete com os acompanhamentos que você escolher.",price:17.99,image:"assets/creme-no-copo.png"},
    {id:"pote-500",name:"Pote 500 ml",category:"pot",description:"Seu pote favorito, montado com açaí, creme ou sorvete e acompanhamentos.",price:29.99,image:"assets/acai-na-chapa.png"},
    {id:"roleta-800",name:"Roleta 800 ml",category:"pot",description:"Uma combinação para dividir, com sabores e acompanhamentos variados.",price:47.99,image:"assets/bolo-de-festa.png"},
    {id:"pote-1kg",name:"Pote 1 kg",category:"pot",description:"Um quilo de sabor para levar para casa ou dividir com a turma.",price:59.99,image:"assets/sorvete-na-chapa.png"},
    {id:"pote-800",name:"Pote 800 ml",category:"pot",description:"Açaí, creme ou sorvete e acompanhamentos para deixar do seu jeito.",price:47.99,image:"assets/acai-na-chapa.png"}
  ];
  const storageKeys = {
    cart: "loka-orders-cart-v1",
    profile: "loka-orders-profile-v1",
    addresses: "loka-orders-addresses-v1",
    history: "loka-orders-history-v1",
    region: "loka-orders-region-v1"
  };
  function readStore(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[character]);
  }
  function money(value) {
    return new Intl.NumberFormat("pt-BR", {style:"currency",currency:"BRL"}).format(value);
  }

  let cart = readStore(storageKeys.cart, {});
  let profile = readStore(storageKeys.profile, {});
  let addresses = readStore(storageKeys.addresses, []);
  let history = readStore(storageKeys.history, []);
  let activeRegion = readStore(storageKeys.region, "");
  let toastTimer = null;

  const promoGrid = document.getElementById("promo-products");
  const potGrid = document.getElementById("pot-products");
  const searchInput = document.getElementById("product-search");
  const noResults = document.getElementById("no-results");
  const cartDialog = document.getElementById("cart-dialog");
  const accountDialog = document.getElementById("account-dialog");
  const regionDialog = document.getElementById("region-dialog");
  const deliveryDialog = document.getElementById("delivery-dialog");

  function productCard(product) {
    const name = escapeHTML(product.name);
    const badge = product.discount ? '<span class="deal-badge">' + escapeHTML(product.discount) + '<small>OFF</small></span>' : "";
    const oldPrice = product.oldPrice ? '<span class="old-price">' + money(product.oldPrice) + '</span>' : "";
    return '<article class="product-card" data-search="' + escapeHTML((product.name + " " + product.description).toLocaleLowerCase("pt-BR")) + '">' +
      badge +
      '<div class="product-info"><span class="product-flag">Sugestão da Loka</span><h3 class="product-name">' + name + '</h3>' +
      '<p class="product-description">' + escapeHTML(product.description) + '</p>' +
      '<div class="product-bottom"><div class="product-prices">' + oldPrice + '<b class="product-price">' + money(product.price) + '</b></div>' +
      '<button class="add-button" type="button" data-add-to-cart="' + escapeHTML(product.id) + '" aria-label="Adicionar ' + name + ' ao carrinho">Adicionar <span aria-hidden="true">+</span></button></div></div>' +
      '<div class="product-photo"><img src="' + escapeHTML(product.image) + '" alt="Foto demonstrativa de ' + name + '" loading="lazy"><span>foto ilustrativa</span></div></article>';
  }
  promoGrid.innerHTML = products.filter(product => product.category === "promo").map(productCard).join("");
  potGrid.innerHTML = products.filter(product => product.category === "pot").map(productCard).join("");

  function currentRegionName() {
    return regions[activeRegion] || "";
  }
  function updateRegionLabels() {
    const name = currentRegionName();
    const selected = document.getElementById("selected-region");
    const summary = document.getElementById("region-summary-text");
    const summaryWrap = document.querySelector(".region-summary");
    const delivery = document.getElementById("delivery-region");
    const cartRegion = document.getElementById("cart-region-name");
    selected.textContent = name || "Escolher região";
    summary.textContent = name
      ? "Região selecionada: " + name + ". A unidade e a cobertura serão confirmadas com os dados oficiais."
      : "Escolha sua região para direcionar o pedido à unidade responsável.";
    summaryWrap.classList.toggle("is-selected", Boolean(name));
    delivery.textContent = name || "Ainda não escolhida";
    cartRegion.textContent = name || "Escolha sua região";
  }
  function openOverlay(overlay) {
    overlay.hidden = false;
    document.body.classList.add("lock-scroll");
  }
  function closeOverlay(overlay) {
    overlay.hidden = true;
    const anotherOpen = [cartDialog, accountDialog, regionDialog, deliveryDialog].some(item => !item.hidden);
    document.body.classList.toggle("lock-scroll", anotherOpen);
  }
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }
  function openAccount(tab) {
    openOverlay(accountDialog);
    setAccountTab(tab || "profile");
    fillProfileForm();
    renderAddresses();
    renderHistory();
  }
  function setAccountTab(tab) {
    document.querySelectorAll("[data-account-tab]").forEach(button => {
      const active = button.dataset.accountTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-account-panel]").forEach(panel => {
      panel.hidden = panel.dataset.accountPanel !== tab;
    });
  }

  function renderProducts() {
    const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    let visibleCount = 0;
    document.querySelectorAll(".product-card").forEach(card => {
      const visible = !query || card.dataset.search.includes(query);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    document.querySelectorAll(".catalog-section").forEach(section => {
      const hasVisible = [...section.querySelectorAll(".product-card")].some(card => !card.hidden);
      section.hidden = !hasVisible;
    });
    noResults.hidden = visibleCount > 0;
  }

  function cartEntries() {
    return Object.entries(cart).filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => ({product:products.find(item => item.id === id),quantity}))
      .filter(item => item.product);
  }
  function cartSubtotal() {
    return cartEntries().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
  function renderCart() {
    const entries = cartEntries();
    const lines = document.getElementById("cart-lines");
    const count = entries.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-items-count").textContent = count + (count === 1 ? " item" : " itens");
    document.getElementById("cart-total-fab").textContent = money(cartSubtotal());
    const badge = document.getElementById("cart-badge");
    badge.textContent = String(count);
    badge.hidden = count === 0;
    document.getElementById("cart-subtotal").textContent = money(cartSubtotal());
    document.getElementById("cart-region-name").textContent = currentRegionName() || "Escolha sua região";
    if (!entries.length) {
      lines.innerHTML = '<div class="cart-empty"><span aria-hidden="true">♡</span><b>Seu carrinho está esperando.</b><p>Adicione uma delícia do cardápio para começar.</p></div>';
    } else {
      lines.innerHTML = entries.map(item =>
        '<article class="cart-line"><img src="' + escapeHTML(item.product.image) + '" alt=""><div class="cart-line-copy"><b>' +
        escapeHTML(item.product.name) + '</b><small>' + money(item.product.price * item.quantity) + '</small></div>' +
        '<div class="quantity-control"><button type="button" data-cart-action="decrease" data-product-id="' + item.product.id + '" aria-label="Diminuir ' + escapeHTML(item.product.name) + '">−</button><b>' + item.quantity + '</b>' +
        '<button type="button" data-cart-action="increase" data-product-id="' + item.product.id + '" aria-label="Aumentar ' + escapeHTML(item.product.name) + '">+</button></div></article>'
      ).join("");
    }
    renderAddressOptions();
  }
  function addProduct(id) {
    if (!products.some(product => product.id === id)) return;
    cart[id] = (cart[id] || 0) + 1;
    writeStore(storageKeys.cart, cart);
    renderCart();
    const product = products.find(item => item.id === id);
    showToast(product.name + " adicionado ao carrinho");
  }
  function renderAddressOptions() {
    const select = document.getElementById("checkout-address-select");
    const current = select.value;
    select.innerHTML = '<option value="">Preencher novo endereço</option>' + addresses.map(address =>
      '<option value="' + escapeHTML(address.id) + '">' + escapeHTML(address.label || "Endereço") + " · " + escapeHTML(address.street) + ", " + escapeHTML(address.number) + " — " + escapeHTML(address.city) + '</option>'
    ).join("");
    select.value = addresses.some(address => address.id === current) ? current : "";
  }
  function fillCheckoutAddress(address) {
    const form = document.getElementById("checkout-form");
    ["cep","street","number","district","city","complement"].forEach(key => {
      if (form.elements[key]) form.elements[key].value = address ? (address[key] || "") : "";
    });
    if (address && address.region && regions[address.region]) {
      activeRegion = address.region;
      writeStore(storageKeys.region, activeRegion);
      updateRegionLabels();
    }
  }
  function saveAddress(address) {
    const duplicate = addresses.find(item => item.cep === address.cep && item.street.toLowerCase() === address.street.toLowerCase() && item.number === address.number);
    if (duplicate) return;
    addresses.unshift(address);
    writeStore(storageKeys.addresses, addresses);
  }
  function renderAddresses() {
    const container = document.getElementById("saved-address-list");
    if (!addresses.length) {
      container.innerHTML = '<div class="empty-state">Você ainda não salvou um endereço. Cadastre um para agilizar seus próximos pedidos.</div>';
      renderAddressOptions();
      return;
    }
    container.innerHTML = addresses.map(address =>
      '<div class="saved-address"><div><b>' + escapeHTML(address.label || "Endereço") + '</b><small>' +
      escapeHTML(address.street) + ', ' + escapeHTML(address.number) + ' · ' + escapeHTML(address.district) + ' · ' + escapeHTML(address.city) +
      (address.region && regions[address.region] ? ' · ' + escapeHTML(regions[address.region]) : '') +
      '</small></div><button type="button" data-remove-address="' + escapeHTML(address.id) + '">Remover</button></div>'
    ).join("");
    renderAddressOptions();
  }
  function fillProfileForm() {
    const form = document.getElementById("profile-form");
    form.elements.name.value = profile.name || "";
    form.elements.phone.value = profile.phone || "";
    form.elements.email.value = profile.email || "";
    const checkout = document.getElementById("checkout-form");
    if (!checkout.elements.name.value) checkout.elements.name.value = profile.name || "";
    if (!checkout.elements.phone.value) checkout.elements.phone.value = profile.phone || "";
  }
  function renderHistory() {
    const container = document.getElementById("order-history-list");
    if (!history.length) {
      container.innerHTML = '<div class="empty-state">Seu histórico vai aparecer aqui depois do primeiro pedido de demonstração.</div>';
      return;
    }
    container.innerHTML = history.map(order =>
      '<article class="history-card"><div class="history-top"><b>Pedido ' + escapeHTML(order.id) + '</b><time>' + escapeHTML(order.date) + '</time></div>' +
      '<div class="history-meta">' + escapeHTML(order.region) + ' · ' + escapeHTML(order.city) + ' · ' + escapeHTML(order.status) + '</div>' +
      '<div class="history-items">' + order.items.map(item => escapeHTML(item.quantity + "× " + item.name)).join("<br>") + '</div>' +
      '<div class="history-total">Total demonstrativo: ' + money(order.total) + '</div></article>'
    ).join("");
  }

  document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) addProduct(addButton.dataset.addToCart);
    const cartAction = event.target.closest("[data-cart-action]");
    if (cartAction) {
      const id = cartAction.dataset.productId;
      if (cartAction.dataset.cartAction === "increase") cart[id] = (cart[id] || 0) + 1;
      else if (cart[id] > 1) cart[id] -= 1;
      else delete cart[id];
      writeStore(storageKeys.cart, cart);
      renderCart();
    }
    const removeAddress = event.target.closest("[data-remove-address]");
    if (removeAddress) {
      addresses = addresses.filter(address => address.id !== removeAddress.dataset.removeAddress);
      writeStore(storageKeys.addresses, addresses);
      renderAddresses();
      showToast("Endereço removido");
    }
  });

  searchInput.addEventListener("input", renderProducts);
  document.getElementById("open-cart").addEventListener("click", () => { renderCart(); fillProfileForm(); openOverlay(cartDialog); });
  document.getElementById("open-account").addEventListener("click", () => openAccount("history"));
  document.getElementById("open-region").addEventListener("click", () => openOverlay(regionDialog));
  document.getElementById("change-region").addEventListener("click", () => openOverlay(regionDialog));
  document.getElementById("cart-change-region").addEventListener("click", () => openOverlay(regionDialog));
  document.getElementById("delivery-choose-region").addEventListener("click", () => {
    closeOverlay(deliveryDialog);
    openOverlay(regionDialog);
  });
  document.getElementById("open-delivery").addEventListener("click", () => openOverlay(deliveryDialog));
  document.querySelectorAll("[data-region]").forEach(button => button.addEventListener("click", () => {
    activeRegion = button.dataset.region;
    writeStore(storageKeys.region, activeRegion);
    updateRegionLabels();
    closeOverlay(regionDialog);
    showToast("Região selecionada: " + currentRegionName());
  }));
  document.getElementById("checkout-address-select").addEventListener("change", event => {
    const address = addresses.find(item => item.id === event.target.value);
    fillCheckoutAddress(address || null);
  });
  document.getElementById("profile-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    profile = {name:form.elements.name.value.trim(),phone:form.elements.phone.value.trim(),email:form.elements.email.value.trim()};
    writeStore(storageKeys.profile, profile);
    fillProfileForm();
    showToast("Cadastro salvo neste navegador");
  });
  document.getElementById("address-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const address = {
      id:"addr-" + Date.now(),
      label:form.elements.label.value.trim() || "Meu endereço",
      cep:form.elements.cep.value.trim(),
      street:form.elements.street.value.trim(),
      number:form.elements.number.value.trim(),
      district:form.elements.district.value.trim(),
      city:form.elements.city.value.trim(),
      complement:form.elements.complement.value.trim(),
      region:activeRegion
    };
    saveAddress(address);
    writeStore(storageKeys.addresses, addresses);
    form.reset();
    renderAddresses();
    showToast("Endereço salvo");
  });
  document.getElementById("checkout-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!cartEntries().length) {
      showToast("Adicione um item antes de confirmar");
      return;
    }
    if (!activeRegion) {
      openOverlay(regionDialog);
      showToast("Escolha sua região para continuar");
      return;
    }
    const form = event.currentTarget;
    const address = {
      id:"addr-" + Date.now(),
      label:"Último pedido",
      cep:form.elements.cep.value.trim(),
      street:form.elements.street.value.trim(),
      number:form.elements.number.value.trim(),
      district:form.elements.district.value.trim(),
      city:form.elements.city.value.trim(),
      complement:form.elements.complement.value.trim(),
      region:activeRegion
    };
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    if (form.elements.saveAddress.checked) {
      profile = Object.assign({}, profile, {name:name,phone:phone});
      writeStore(storageKeys.profile, profile);
      saveAddress(address);
      writeStore(storageKeys.addresses, addresses);
    }
    const orderItems = cartEntries().map(item => ({name:item.product.name,quantity:item.quantity}));
    const newOrder = {
      id:"LA-" + String(Date.now()).slice(-6),
      date:new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date()),
      status:"Demonstração",
      region:currentRegionName(),
      city:address.city,
      total:cartSubtotal(),
      items:orderItems
    };
    history.unshift(newOrder);
    writeStore(storageKeys.history, history);
    cart = {};
    writeStore(storageKeys.cart, cart);
    renderCart();
    renderHistory();
    closeOverlay(cartDialog);
    openAccount("history");
    showToast("Pedido de demonstração salvo no histórico");
  });

  document.querySelectorAll("[data-account-tab]").forEach(button => button.addEventListener("click", () => setAccountTab(button.dataset.accountTab)));
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => {
    const overlay = document.getElementById(button.dataset.close);
    if (overlay) closeOverlay(overlay);
  }));
  [cartDialog, accountDialog, regionDialog, deliveryDialog].forEach(overlay => {
    overlay.addEventListener("click", event => { if (event.target === overlay) closeOverlay(overlay); });
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      [regionDialog, deliveryDialog, accountDialog, cartDialog].forEach(overlay => {
        if (!overlay.hidden) closeOverlay(overlay);
      });
    }
  });
  document.querySelectorAll(".category-tabs a").forEach(link => link.addEventListener("click", () => {
    document.querySelectorAll(".category-tabs a").forEach(item => item.classList.toggle("is-active", item === link));
  }));

  updateRegionLabels();
  renderCart();
  renderAddresses();
  fillProfileForm();
})();
