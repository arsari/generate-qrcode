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
canvas.style.display = "none"; // Hide canvas from UI
const previewImg = document.querySelector("#qrPreview");
const testLink = document.querySelector("#testLink");
const ctx = canvas.getContext("2d");

// — Retina-Ready Setup —
const dpr = window.devicePixelRatio || 1;
const size = 300;
canvas.width = size * dpr;
canvas.height = size * dpr;
ctx.scale(dpr, dpr);

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

colorPicker.addEventListener("input", (e) => {
  colorText.value = e.target.value;
});
colorText.addEventListener("input", (e) => {
  const val = e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    colorPicker.value = val;
  }
});

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

  downloadBtn.disabled = true;

  const data = encodeURIComponent(textInput.value.trim());
  const { r, g, b } = hexToRgb(colorPicker.value);
  const colorParam = `${r}-${g}-${b}`;

  let apiUrl =
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=${size}x${size}` +
    `&data=${data}` +
    `&color=${colorParam}` +
    `&ecc=H`;

  if (!transparentBox.checked) {
    apiUrl += `&bgcolor=255-255-255`;
  }

  const qrImg = new Image();
  qrImg.crossOrigin = "anonymous";
  qrImg.onload = () => {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(qrImg, 0, 0, size, size);

    if (transparentBox.checked) {
      const imgData = ctx.getImageData(0, 0, size, size);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] === 255 && d[i + 1] === 255 && d[i + 2] === 255) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const shape = document.querySelector('input[name="shape"]:checked').value;

    if (logoImg) {
      const logoSize = size * 0.2;
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

    const dataUrl = canvas.toDataURL("image/png");
    previewImg.src = dataUrl;
    testLink.href = textInput.value.trim();
    testLink.textContent = "Open/Preview QR Content";
    downloadBtn.disabled = false;
  };

  qrImg.src = apiUrl;
});

// — Download —
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${textInput.value || "qr"}-qrcode.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  logoInput.value = "";
  logoImg = null;
  ctx.clearRect(0, 0, size, size);
  downloadBtn.disabled = true;
  previewImg.src = "";
  testLink.href = "#";
  testLink.textContent = "";
});
