// Pillar contenedor de entrada.
function element(el) {
  return document.getElementById(el);
}

// Restablece la cookie y crea un nuevo juego.
function resetGame() {
  deleteAllCookies();
  newGame(window.game.data);
  hideResetPopup();
}

// Generar nuevos datos del juego.
function newGame(data) {
  window.game = new Object();
  window.game.data = data; // todas las palabras.
  window.game.pangram = getTargetPangram(window.game.data); // selecciona el pangrama.
  window.game.current_score = 0; // marcador actual.
  window.game.total_score = getTotalScore(
    window.game.data,
    window.game.pangram
  ); // Puntuacion posible total.
  window.game.words = getWords(window.game.data, window.game.pangram); // palabras válidas que se pueden introducir.
  window.game.entered = new Array(); // palabras que se han introducido.
  window.game.popup_active = false; // idicador de emergente activa.
  window.game.show_all_popup = true; // idicador para indicar si se muestra la emergente.
  window.game.show_victory_popup = true; // indicador para indicar si se muestra la emergente de victoria.

  changeProgress(0); // pone a cero la barra de progreso
  addWordsToEntered();
  setUpDropdown();
  setUpScreenKeys(window.game.pangram, true);
  setUpAboutPopup();
  setUpPrevPopup();
  setUpProgressPopup();
  setUpReturnPopup();
  setUpVictoryPopup();
  setUpAllPopup();

  if (returnPopupNotShownYet) {
    if (window.game.current_score != 0 && getRankNumber(window.game.current_score) != 0) {
      showReturnPopup();
    }
    returnPopupNotShownYet = false;
  }
}

// Comprueba que todo son letras (falta la Ñ).
function isLetter(key) {
  return (
    key.length == 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(key.toUpperCase())
  );
}

// Obtener la fecha de hoy con HH/MM/SS en blanco, más algunos días.
function getDateWithOffset(offset = 0) {
  let today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  let tomorrow = today.setDate(today.getDate() + offset);
  return new Date(tomorrow);
}

// Obtener la cantidad de días entre una fecha proporcionada (por defecto, hoy) y el 1 de enero.
// 1970, añadiendo un número opcional de días 
function getDayNumber(offset = 0) {
  let d = getDateWithOffset(offset);
  let DAYS_TO_MILLISECONDS = 24 * 60 * 60 * 1000;
  return Math.floor(d.getTime() / DAYS_TO_MILLISECONDS);
}

// Guardar las palabras acertadas en la cookie.
function setCookie() {
  let entered_words = window.game.entered.join("|");
  document.cookie =
    window.game.pangram +
    "-entered=" +
    entered_words +
    "; expires=" +
    getDateWithOffset(2).toUTCString();
}

// Cargue las palabras guardadas en la cookie, con un desplazamiento para especificar qué día.
function getCookie(offset = 0) {
  let raw_cookie = document.cookie.split(";");
  if (document.cookie.length == 0) {
    return new Array();
  }
  for (cookie of raw_cookie) {
    let cookie_pangram = cookie.trim().split("-")[0];
    if (cookie_pangram == getTargetPangram(window.game.data, offset)) {
      return cookie.trim().split("=")[1].split("|");
    }
  }

  return new Array();
}

// Guardar cookie de modo oscuro.
function setDarkCookie() {
  document.cookie =
    "!dark-entered=" +
    (document.body.classList.contains("dark") ? "dark" : "light") +
    "; expires=" +
    getDateWithOffset(365).toUTCString();
}

// Cargar la cookie de modo oscuro.
function getDarkCookie() {
  let raw_cookie = document.cookie.split(";");
  if (document.cookie.length == 0) {
    return;
  }
  for (cookie of raw_cookie) {
    let cookie_head = cookie.trim().split("-")[0];
    if (cookie_head == "!dark") {
      switchDarkMode(cookie.trim().split("=")[1]);
      return;
    }
  }
}

// Eliminar todas las cookies.
function deleteAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
