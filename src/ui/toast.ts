import type { ToastType } from '../types';

export function showToast(message: string, type?: ToastType): void {
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
