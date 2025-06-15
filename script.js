// — Element references —
const textInput = document.querySelector("#textInput");
const logoInput = document.querySelector("#logoInput");
const colorPicker = document.querySelector("#qrColor");
const colorText = document.querySelector("#qrColorText");
const transparentBox = document.querySelector("#transparentBg");
const generateBtn = document.querySelector("#generate");
const downloadBtn = document.querySelector("#download");
const clearBtn = document.querySelector("#clear");
const canvas = document.querySelector("#qrCanvas");
const ctx = canvas.getContext("2d");

// — Retina-Ready Setup —
// Scale the backing store for high-DPI (“Retina”) displays:
const dpr = window.devicePixelRatio || 1;
const size = 300; // logical size in CSS pixels
canvas.width = size * dpr; // physical pixels
canvas.height = size * dpr;
canvas.style.width = `${size}px`; // CSS display size
canvas.style.height = `${size}px`;
ctx.scale(dpr, dpr); // ensure drawing uses logical pixels

// — Load logo when selected —
let logoImg = null;
logoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    logoImg = new Image();
    logoImg.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// — Sync color picker ↔ text field —
colorPicker.addEventListener("input", (e) => {
  colorText.value = e.target.value;
});
colorText.addEventListener("input", (e) => {
  const val = e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    colorPicker.value = val;
  }
});

// — Utility: convert "#RRGGBB" → { r, g, b } —
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// — Generate QR Code —
generateBtn.addEventListener("click", () => {
  if (!textInput.value.trim()) {
    ctx.clearRect(0, 0, size, size);
    downloadBtn.disabled = true;
    alert("Please enter text to generate QR code.");
    return;
  }
  // Disable download until rendering completes
  downloadBtn.disabled = true;

  // Prepare data & color parameters
  const data = encodeURIComponent(textInput.value);
  const { r, g, b } = hexToRgb(colorPicker.value);
  const colorParam = `${r}-${g}-${b}`; // API expects hyphens

  let apiUrl =
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=${size}x${size}` +
    `&data=${data}` +
    `&color=${colorParam}`;

  if (!transparentBox.checked) {
    apiUrl += `&bgcolor=255-255-255`; // white background with hyphens
  }

  // Load QR image
  const qrImg = new Image();
  qrImg.crossOrigin = "anonymous";
  qrImg.onload = () => {
    // Clear & draw QR at logical size
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(qrImg, 0, 0, size, size);

    // If transparent, strip white pixels
    if (transparentBox.checked) {
      const imgData = ctx.getImageData(0, 0, size, size);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 250 && d[i + 1] > 250 && d[i + 2] > 250) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Determine selected shape
    const shape = document.querySelector('input[name="shape"]:checked').value;

    // Draw logo (clipped to circle if requested)
    if (logoImg) {
      const logoSize = size * 0.3; // 20% of QR
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;

      ctx.save();
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(
          x + logoSize / 2,
          y + logoSize / 2,
          logoSize / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
      }
      ctx.drawImage(logoImg, x, y, logoSize, logoSize);
      ctx.restore();
    }

    // Enable download now that canvas is up-to-date
    downloadBtn.disabled = false;
  };

  qrImg.src = apiUrl;
});

// — Download as PNG —
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${textInput.value || "qr"}-qrcode.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// - Clear canvas and inputs -
clearBtn.addEventListener("click", () => {
  textInput.value = "";
  logoInput.value = "";
  logoImg = null;
  ctx.clearRect(0, 0, size, size);
  downloadBtn.disabled = true;
});
