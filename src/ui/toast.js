// Transient toast notifications shown in the bottom toast stack.
export function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('toast--show');
  });

  setTimeout(function () {
    toast.classList.remove('toast--show');
    setTimeout(function () {
      toast.remove();
    }, 280);
  }, 2400);
}
