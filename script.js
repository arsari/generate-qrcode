const input = document.querySelector('input[type="text"]');
const logoInput = document.querySelector("#logoInput");
const generateBtn = document.querySelector("#generate");
const downloadBtn = document.querySelector("#download");
const canvas = document.querySelector("#qrCanvas");
const ctx = canvas.getContext("2d");

let logoImg = null;

logoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      logoImg = new Image();
      logoImg.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

generateBtn.addEventListener("click", () => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    input.value
  )}`;
  const qrImg = new Image();
  qrImg.crossOrigin = "anonymous";
  qrImg.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(qrImg, 0, 0, 250, 250);

    // Draw logo if available
    if (logoImg) {
      const size = 50; // Best practice: 20% or less of QR size
      const x = (canvas.width - size) / 2;
      const y = (canvas.height - size) / 2;
      ctx.drawImage(logoImg, x, y, size, size);
    }
  };
  qrImg.src = qrUrl;
});

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${input.value}-qrcode.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});
