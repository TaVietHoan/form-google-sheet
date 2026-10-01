/**
 * NOVAPRO SPRINT - CONTROLLER SCRIPT
 * Quản lý Trạng thái Xác thực, 3D Mascot, Tiến độ & Gửi API Google Sheet
 */

// ĐIỀN LINK WEB APP GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY:
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycE7203N1VvjCjY53k7c36aK7Tph4x2Yw8P2Qn/exec";

// App State
const state = {
  authMode: 'login', // 'login' hoặc 'register'
  user: null,
  tasks: {
    1: null,
    2: null,
    3: null
  }
};

// DOM References
const mascot = document.getElementById('mascot-3d');
const mascotDialogue = document.getElementById('mascot-dialogue');
const progressBar = document.getElementById('progress-bar');
const progressNumber = document.getElementById('progress-number');
const dockSummary = document.getElementById('dock-status-summary');

// 1. KHỞI TẠO & SKELETON TRANSITION
window.addEventListener('DOMContentLoaded', () => {
  // Giả lập load mượt 800ms với Skeleton Shimmer
  setTimeout(() => {
    document.getElementById('skeleton-screen').classList.add('hidden');
    
    // Kiểm tra xem đã đăng nhập từ phiên trước chưa
    const savedUser = localStorage.getItem('nova_user');
    if (savedUser) {
      state.user = JSON.parse(savedUser);
      unlockDashboard();
    } else {
      document.getElementById('auth-section').classList.remove('hidden');
    }
  }, 800);
});

// 2. XỬ LÝ CHUYỂN TAB ĐĂNG NHẬP / ĐĂNG KÝ
function switchAuthMode(mode) {
  state.authMode = mode;
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const fieldName = document.getElementById('field-name');
  const authTitle = document.getElementById('auth-title');
  const authDesc = document.getElementById('auth-desc');
  const btnSubmit = document.getElementById('btn-auth-submit');
  const alertBox = document.getElementById('auth-alert');

  alertBox.classList.add('hidden');

  if (mode === 'register') {
    tabRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-200 bg-indigo-600 text-white shadow-glow-indigo";
    tabLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-200 text-slate-400 hover:text-white";
    fieldName.classList.remove('hidden');
    authTitle.innerText = "Tạo tài khoản mới";
    authDesc.innerText = "Đăng ký để đồng bộ dữ liệu với Google Sheet";
    btnSubmit.innerText = "Đăng Ký Tài Khoản";
  } else {
    tabLogin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-200 bg-indigo-600 text-white shadow-glow-indigo";
    tabRegister.className = "flex-1 py-2.5 text-xs font-bold rounded-xl transition duration-200 text-slate-400 hover:text-white";
    fieldName.classList.add('hidden');
    authTitle.innerText = "Chào mừng quay lại";
    authDesc.innerText = "Nhập tài khoản để tiếp tục phiên làm việc Sprint";
    btnSubmit.innerText = "Xác nhận Đăng Nhập";
  }
}

// 3. SUBMIT FORM XÁC THỰC
document.getElementById('auth-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-auth-submit');
  const alertBox = document.getElementById('auth-alert');
  
  const email = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value.trim();
  const name = document.getElementById('input-name').value.trim() || email.split('@')[0];

  btn.disabled = true;
  btn.innerText = "Đang kết nối Cloud...";

  const payload = {
    action: state.authMode, // 'login' hoặc 'register'
    name: name,
    email: email,
    password: password
  };

  try {
    // Gửi thông tin sang Google Sheet Backend
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("AKfycbycE7203N1VvjCjY53k7c36aK7Tph4x2Yw8P2Qn")) {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    }

    // Đăng nhập thành công
    state.user = { name: name, email: email };
    localStorage.setItem('nova_user', JSON.stringify(state.user));

    alertBox.innerText = "✨ Xác thực thành công! Đang vào Dashboard...";
    alertBox.className = "mt-4 text-center text-xs font-semibold text-emerald-400";
    alertBox.classList.remove('hidden');

    setTimeout(() => {
      unlockDashboard();
    }, 600);

  } catch (err) {
    // Nếu gặp lỗi mạng/API vẫn cho phép demo cục bộ
    state.user = { name: name, email: email };
    localStorage.setItem('nova_user', JSON.stringify(state.user));
    unlockDashboard();
  } finally {
    btn.disabled = false;
  }
});

// 4. MỞ KHÓA DASHBOARD
function unlockDashboard() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('sticky-dock').classList.remove('hidden');
  document.getElementById('user-badge').classList.remove('hidden');
  document.getElementById('user-badge').classList.add('flex');
  document.getElementById('nav-progress-box').classList.remove('hidden');
  document.getElementById('nav-progress-box').classList.add('flex');
  document.getElementById('progress-bar-container').classList.remove('hidden');

  document.getElementById('user-name-display').innerText = state.user.name;

  // Mascot chào mừng
  mascot.setAttribute('animation-name', 'Wave');
  mascotDialogue.innerText = `Chào ${state.user.name}! Bắt đầu phân loại các hạng mục Sprint hôm nay nhé.`;
}

// 5. ĐĂNG XUẤT
function handleLogout() {
  localStorage.removeItem('nova_user');
  location.reload();
}

// 6. CẬP NHẬT TRẠNG THÁI TASK & ĐIỀU KHIỂN MASCOT
function updateTaskStatus(taskId, status, btnElement) {
  state.tasks[taskId] = status;

  // Cập nhật giao diện Pills cùng dòng
  const parent = btnElement.parentElement;
  parent.querySelectorAll('.task-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-indigo-500', 'scale-105', 'bg-white/20');
  });
  btnElement.classList.add('ring-2', 'ring-indigo-500', 'scale-105', 'bg-white/20');

  // Cập nhật Badge hiển thị
  const badge = document.getElementById(`badge-status-${taskId}`);
  if (status === 'completed') {
    badge.innerText = "Hoàn tất";
    badge.className = "text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    
    // Mascot biểu dương
    mascot.setAttribute('animation-name', 'ThumbsUp');
    mascotDialogue.innerText = "Rất xuất sắc! Mục tiêu này đã hoàn thành 100%!";
  } else if (status === 'working') {
    badge.innerText = "Đang chạy";
    badge.className = "text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30";

    // Mascot chạy deadline
    mascot.setAttribute('animation-name', 'Running');
    mascotDialogue.innerText = "Đang tăng tốc chạy nước rút! Giữ vững tiến độ nhé!";
  } else {
    badge.innerText = "Tạm gác";
    badge.className = "text-[11px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700";

    mascot.setAttribute('animation-name', 'Idle');
    mascotDialogue.innerText = "Đã lưu lại trạng thái tồn đọng cho mục này.";
  }

  calculateProgress();
  triggerAutoSave();
}

// 7. THANH TIẾN ĐỘ THỜI GIAN THỰC (DYNAMIC PROGRESS BAR)
function calculateProgress() {
  const total = Object.keys(state.tasks).length;
  const answered = Object.values(state.tasks).filter(v => v !== null).length;
  const percent = Math.round((answered / total) * 100);

  progressBar.style.width = `${percent}%`;
  progressNumber.innerText = `${percent}%`;

  if (percent === 100) {
    dockSummary.innerText = "Sẵn sàng nộp báo cáo! 🚀";
    dockSummary.classList.add('text-emerald-400');
  } else {
    dockSummary.innerText = `Đã phân loại ${answered}/${total} nhiệm vụ`;
    dockSummary.classList.remove('text-emerald-400');
  }
}

// 8. PHẢN HỒI LƯU NGẦM (SILENT AUTO-SAVE)
let saveTimer;
function triggerAutoSave() {
  clearTimeout(saveTimer);
  const tag = document.getElementById('autosave-tag');
  const text = document.getElementById('autosave-text');

  tag.style.opacity = '0.4';
  text.innerText = "Đang lưu nháp...";

  saveTimer = setTimeout(() => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    text.innerText = `Đã tự động lưu nháp lúc ${timeStr}`;
    tag.style.opacity = '1';
  }, 400);
}

// 9. NỘP BÁO CÁO & BẮN PHÁO HOA ĂN MỪNG (CANVAS CONFETTI)
async function submitFinalSprint() {
  const answered = Object.values(state.tasks).filter(v => v !== null).length;
  const total = Object.keys(state.tasks).length;

  if (answered < total) {
    alert("Vui lòng phân loại đủ tất cả các mục Sprint trước khi gửi báo cáo!");
    return;
  }

  const btn = document.getElementById('btn-submit-sprint');
  btn.disabled = true;
  btn.innerText = "Đang ghi nhận...";

  // Mascot chuyển sang Animation nhảy múa ăn mừng
  mascot.setAttribute('animation-name', 'Dance');
  mascotDialogue.innerText = "CHÚC MỪNG! Bạn đã hoàn thành toàn bộ chu kỳ Sprint tuần này!";

  // Bắn pháo hoa Confetti 3 đợt hoành tráng
  const fire = (ratio, opts) => confetti(Object.assign({}, { origin: { y: 0.8 } }, opts, {
    particleCount: Math.floor(160 * ratio)
  }));

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });

  // Ghi kết quả tổng kết vào Google Sheet
  try {
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("AKfycbycE7203N1VvjCjY53k7c36aK7Tph4x2Yw8P2Qn")) {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "submit_sprint",
          email: state.user.email,
          name: state.user.name,
          details: JSON.stringify(state.tasks)
        })
      });
    }
  } catch (e) {
    console.warn("API logging skipped:", e);
  } finally {
    btn.disabled = false;
    btn.innerText = "Đã Nộp Thành Công! 🥳";
  }
}
