// Этот файл создан для того, чтобы сборка на Render.com работала корректно
// Он будет автоматически перенаправлять на корректную версию проекта

// Редирект на основную страницу
window.location.href = "https://frontend-19x7.onrender.com";

// Запасной вариант на случай, если редирект не сработает
document.addEventListener('DOMContentLoaded', () => {
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: sans-serif;">
      <h1>Перенаправление...</h1>
      <p>Если вы не были автоматически перенаправлены, <a href="https://frontend-19x7.onrender.com">нажмите здесь</a>.</p>
    </div>
  `;
}); 