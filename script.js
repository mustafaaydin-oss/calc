const formatCurrency = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const modal = {
  container: document.getElementById("alert-modal"),
  message: document.getElementById("modal-message"),
  close: document.getElementById("modal-close"),
  overlay: document.querySelector("#alert-modal .modal__overlay"),
};

const openModal = (message) => {
  modal.message.innerHTML = message;
  modal.container.classList.add("is-open");
  modal.container.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.container.classList.remove("is-open");
  modal.container.setAttribute("aria-hidden", "true");
};

const setResult = (el, message, isError = false) => {
  if (isError) {
    openModal(message);
    return;
  }

  el.innerHTML = message;
  el.classList.remove("error");
};

const motorEldenTaksitli = {
  pesinatYuzdesi: 0.35,
  oranlar: {
    "1": 1.15,
    "2": 1.21,
    "3": 1.27,
    "4": 1.33,
    "5": 1.39,
    "6": 1.46,
    "7": 1.52,
    "8": 1.58,
  },
};

const motorKrediKarti = {
  pesinatYuzdesi: 0.20,
  oranlar: {
    "2": 0.94,
    "3": 0.92,
    "4": 0.9,
    "5": 0.885,
    "6": 0.865,
    "7": 0.85,
    "8": 0.83,
    "9": 0.81,
    "10": 0.79,
    "11": 0.77,
    "12": 0.75,
  },
};

const telefonEldenTaksitli = {
  pesinatYuzdesi: 0.4,
  oranlar: {
    "1": 1.1,
    "2": 1.18,
    "3": 1.25,
    "4": 1.32,
    "5": 1.39,
    "6": 1.46,
    "7": 1.53,
    "8": 1.59,
    "9": 1.65,
    "10": 1.71,
    "11": 1.77,
    "12": 1.83,
    "13": 1.89,
    "14": 1.95,
  },
};

const calculate = ({
  priceInput,
  downInput,
  termSelect,
  resultEl,
  config,
  label,
}) => {
  const priceRaw = priceInput.value.trim();
  const downRaw = downInput.value.trim();
  const price = parseNumber(priceRaw);
  const down = parseNumber(downRaw);
  const term = termSelect.value;

  if (!priceRaw || !downRaw) {
    setResult(resultEl, "Peşin fiyat ve peşinat alanları boş bırakılamaz.", true);
    return;
  }

  if (price <= 0) {
    setResult(resultEl, "Peşin fiyat 0'dan büyük olmalı.", true);
    return;
  }

  if (down > price) {
    setResult(resultEl, "Peşinat peşin fiyattan büyük olamaz.", true);
    return;
  }

  const minDown = price * config.pesinatYuzdesi;
  if (down < minDown) {
    setResult(
      resultEl,
      `<span class="big-message">Peşinat en az ${Math.round(
        config.pesinatYuzdesi * 100
      )}% olmalı.</span><br/>Alınması gereken tutar: ${formatCurrency(
        minDown
      )}.`,
      true
    );
    return;
  }

  const rate = config.oranlar[term];
  if (!rate) {
    setResult(resultEl, "Lütfen geçerli bir vade seçin.", true);
    return;
  }

  const remaining = Math.max(price - down, 0);
  const totalInstallment = remaining * rate;
  const monthly = totalInstallment / Number(term);

  setResult(
    resultEl,
    `<div class="result-card">
      <div class="result-title">${label} sonucu</div>
      <div class="result-grid">
        <div class="result-item">
          <span>Kalan Tutar</span>
          <strong>${formatCurrency(remaining)}</strong>
        </div>
        <div class="result-item">
          <span>Taksitli Toplam</span>
          <strong>${formatCurrency(totalInstallment)}</strong>
        </div>
        <div class="result-item">
          <span>Aylık Taksit</span>
          <strong>${formatCurrency(monthly)}</strong>
        </div>
      </div>
    </div>`
  );
};

const init = () => {
  const eldenTerm = document.getElementById("elden-term");
  const krediTerm = document.getElementById("kredi-term");
  const telefonTerm = document.getElementById("telefon-term");

  modal.close.addEventListener("click", closeModal);
  modal.overlay.addEventListener("click", closeModal);

  document.getElementById("elden-calc").addEventListener("click", () =>
    calculate({
      priceInput: document.getElementById("elden-price"),
      downInput: document.getElementById("elden-down"),
      termSelect: eldenTerm,
      resultEl: document.getElementById("elden-result"),
      config: motorEldenTaksitli,
      label: "Elden taksitli",
    })
  );

  document.getElementById("kredi-calc").addEventListener("click", () =>
    calculate({
      priceInput: document.getElementById("kredi-price"),
      downInput: document.getElementById("kredi-down"),
      termSelect: krediTerm,
      resultEl: document.getElementById("kredi-result"),
      config: motorKrediKarti,
      label: "Kredi kartı",
    })
  );

  document.getElementById("telefon-calc").addEventListener("click", () =>
    calculate({
      priceInput: document.getElementById("telefon-price"),
      downInput: document.getElementById("telefon-down"),
      termSelect: telefonTerm,
      resultEl: document.getElementById("telefon-result"),
      config: telefonEldenTaksitli,
      label: "Telefon elden taksitli",
    })
  );
};

init();
