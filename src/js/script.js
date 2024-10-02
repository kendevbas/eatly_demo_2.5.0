//header выпадающее меню
const hamburger = document.getElementById('hamburger');
const dropdownMenu = document.getElementById('dropdownMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  dropdownMenu.classList.toggle('show');
});