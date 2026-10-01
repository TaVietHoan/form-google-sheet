// Dán link Web App bạn đã copy ở Bước 3 vào đây
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4Ppnkt2N9yB9fwbY65ujoCxLWLiGGEwOo-tFkqxbl0bbxVB4HIc0plr1NZMIjs0MX/exec";

const form = document.getElementById("myForm");
const btnSubmit = document.getElementById("btnSubmit");
const statusMsg = document.getElementById("statusMsg");

form.addEventListener("submit", async function(e) {
  e.preventDefault(); // Ngăn trình duyệt reload lại trang

  // 1. Thu thập dữ liệu từ các ô input
  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  // 2. Cập nhật nút bấm sang trạng thái đang gửi
  btnSubmit.disabled = true;
  btnSubmit.innerText = "Đang lưu dữ liệu...";
  statusMsg.classList.add("hidden");

  try {
    // 3. Gửi dữ liệu qua Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        // Bí quyết chống lỗi CORS: Dùng text/plain
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success") {
      statusMsg.innerText = "🎉 Tuyệt vời! Đã lưu dữ liệu vào Google Sheet!";
      statusMsg.className = "mt-4 text-center text-sm font-semibold text-emerald-600";
      form.reset(); // Xóa sạch form sau khi gửi thành công
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    statusMsg.innerText = "❌ Đã có lỗi xảy ra: " + error.message;
    statusMsg.className = "mt-4 text-center text-sm font-semibold text-rose-600";
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Gửi dữ liệu";
    statusMsg.classList.remove("hidden");
  }
});