// Definir variables para la clasificación.
let LEVEL_PERCENTS = [0.7, 0.55, 0.4, 0.25, 0.2, 0.15, 0.1, 0.05, 0];
let LEVEL_NAMES = [
  "Xenial",
  "Excepcional",
  "Fabuloso",
  "Magnífico",
  "Muito ben",
  "Ben",
  "Mellorando",
  "Principiante",
  "Xurdindo",
];

if (hmm()) {
  LEVEL_NAMES = [
    "Xenial",
    "Excepcional",
    "Fabuloso",
    "Magnífico",
    "Muito ben",
    "Ben",
    "Mellorando ",
    "Principiante",
    "Xurdindo",
  ];
}

// Obtener el número de rango de progreso, donde 8 es el más bajo y 0 es el más alto.
function getRankNumber(progress) {
  for (i of Array(LEVEL_PERCENTS.length)
  .fill()
  .map((x, i) => i)) {
    if (progress >= Math.floor(window.game.total_score * LEVEL_PERCENTS[i])) {
      return i;
    }
  }
}

// Obtener el siguiente texto de progreso.
function getProgressNextText(progress) {
  let maximum = window.game.total_score;
  let rank = getRankNumber(progress);
  let next_text = "";
  if (rank != 0) {
    let next_score = Math.floor(maximum * LEVEL_PERCENTS[rank - 1]);
    let diff = next_score - progress;
    next_text = diff + " pa " + LEVEL_NAMES[rank - 1];
  }

  element("progress-next").textContent = next_text;
}

// Cambiar el progreso de la barra de progreso.
function changeProgress(progress) {
  let maximum = window.game.total_score;
  getProgressNextText(progress);
  for (i of Array(LEVEL_PERCENTS.length)
    .fill()
    .map((x, i) => i)) {
    if (progress >= Math.floor(maximum * LEVEL_PERCENTS[i])) {
      element("progress-name").textContent = LEVEL_NAMES[i];
      element("progress-current-score").textContent = progress;
      element("progress-current").style.left = `calc(${9 - i - 1} * 100% / 9)`;
      let dots = element("progress-dots").children;
      for (j of Array(LEVEL_PERCENTS.length)
        .fill()
        .map((x, i) => i)) {
        let dot = dots[j].children[0];
        if (j < 9 - i - 1) {
          dot.classList.remove("progress-incomplete");
          dot.classList.add("progress-complete");
        } else {
          dot.classList.remove("progress-complete");
          dot.classList.add("progress-incomplete");
        }
      }

      // Activar victoria si llegamos al rango más alto.
      if (progress == maximum && window.game.show_all_popup) {
        showAllPopup();
        window.game.showVictoryPopup = false;
      } else if (i == 0 && window.game.show_victory_popup) {
        showVictoryPopup();
      }

      break;
    }
  }
}

// Escribir en mayúscula la letra inicial para formatear.
function capitalizeInitial(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Introducir palabra.
function addWordToEntered(word) {
  let entered_words = element("entered-words");
  if (window.game.entered.length == 0) {
    entered_words.textContent = "";
    entered_words.classList.remove("entered-words-start");
  }
  window.game.entered.push(word.toUpperCase());

  let elem = document.createElement("span");
  elem.classList.add("entered-word");
  elem.textContent = capitalizeInitial(word);
  if (isPangram(word)) {
    elem.classList.add("highlight-background");
    elem.style.color = "var(--color-text-gray-highlight)";
  }
  entered_words.insertBefore(elem, entered_words.firstChild);
  setCookie();
}

// Rellenar la pantalla de las palabras de la matriz.
function populateEnteredWords(arr) {
  // Restablecer palabras.
  let entered_words = element("entered-words");
  entered_words.textContent = "";
  for (word of arr) {
    let elem = document.createElement("span");
    elem.classList.add("entered-word");
    elem.textContent = capitalizeInitial(word);
    if (isPangram(word)) {
      elem.classList.add("highlight-background");
      elem.style.color = "var(--color-text-gray-highlight)";
    }
    entered_words.insertBefore(elem, entered_words.firstChild);
  }
}

// Rellenar la pantalla de palabras ingresadas desde la matriz, ordenando alfabéticamente primero.
function populateAlphabetizedWords(arr) {
  let arr_copy = arr.slice(); // Hacer copia para no modificar el original.
  arr_copy.sort();
  arr_copy.reverse(); // en orden inverso debido a cómo se ingresan las palabras.
  populateEnteredWords(arr_copy);
}

// Cargue palabras de la cookie, si existe.
function addWordsToEntered() {
  let cookie_entered = getCookie();
  if (cookie_entered !== null) {
    window.game.entered = getCookie();
    window.game.current_score = 0;
    populateEnteredWords(cookie_entered);
    for (word of window.game.entered) {
      window.game.current_score += getScore(word);
    }
    changeProgress(window.game.current_score);
  }
}

// Configurar menú desplegable
function setUpDropdown() {
  let entered_words = element("entered-words");

  if (window.game.entered.length == 0) {
    entered_words.textContent = "Your words...";
    entered_words.classList.add("entered-words-start");
  }
  let chevron = element("entered-toggle");
  chevron.onclick = toggleEnteredDropdown;
  entered_words.onclick = toggleEnteredDropdown;
}

// Alternar entrada desplegable.
function toggleEnteredDropdown() {
  let chevron = element("entered-toggle");
  let entered_words = element("entered-words");
  let entered_container = element("entered-container");
  let below_entered = element("below-entered-container");
  if (!chevron.classList.contains("entered-toggle-expanded")) {
    chevron.classList.add("entered-toggle-expanded");
    entered_words.classList.add("entered-words-expanded");
    entered_container.classList.add("entered-container-expanded");
    below_entered.classList.add("below-entered-container-hidden");
    populateAlphabetizedWords(window.game.entered);

    let elem = document.createElement("span");
    elem.classList.add("entered-word-number");
    elem.textContent =
      "Atopache " +
      window.game.entered.length +
      (window.game.entered.length == 1 ? " palabra" : " palabras");
    entered_words.insertBefore(elem, entered_words.firstChild);
  } else {
    chevron.classList.remove("entered-toggle-expanded");
    entered_words.classList.remove("entered-words-expanded");
    entered_container.classList.remove("entered-container-expanded");
    below_entered.classList.remove("below-entered-container-hidden");
    populateEnteredWords(window.game.entered);
    if (window.game.entered.length == 0) {
      entered_words.textContent = "Your words...";
      entered_words.classList.add("entered-words-start");
    }
  }
}

// Mostrar un mensaje, segun tipo.
// 0 = malo, 1 = bueno, 2 = pangrama
function showMessage(message, message_type) {
  container = element("message");
  container.textContent = message;
  container.style.opacity = 1;

  switch (message_type) {
    case 0:
      container.classList.add("message-bad");
      break;
    case 1:
      container.classList.add("message-good");
      break;
    case 2:
      container.classList.add("message-pangram");
      break;
  }

  setTimeout(function () {
    container.style.opacity = 0;
  }, 1000);

  setTimeout(function () {
    container.style.opacity = 0;
    switch (message_type) {
      case 0:
        container.classList.remove("message-bad");
        break;
      case 1:
        container.classList.remove("message-good");
        break;
      case 2:
        container.classList.remove("message-pangram");
        break;
    }
  }, 1200);
}

// Configurar la función de entrada de teclado.
function setUpKeyboardInput() {
  document.addEventListener("keydown", function (e) {
    // Solo ingresar letras o reconocer los espacios de retroceso y las teclas de entrada.
    // No las reconoce cuando las ventanas emergentes o desplegables están activas.
    if (
      !window.game.popup_active &&
      !element("entered-toggle").classList.contains("entered-toggle-expanded")
    ) {
      if (isLetter(e.key)) {
        simulateKeyPress(e.key);
        addLetterEntry(e.key);
      } else if (e.key == "Backspace") {
        event.preventDefault();
        simulateNavPress("button-delete");
        removeLetterEntry();
      } else if (e.key == "Enter") {
        event.preventDefault();
        simulateNavPress("button-enter");
        enterWord();
      } else if (e.keyCode == 32) {
        event.preventDefault();
        simulateNavPress("button-shuffle");
        shuffleScreenKeys();
      }
    }
  });
}

// Hacer que la letra parpadee.
function simulateKeyPress(letter) {
  for (k of Array(6)
    .fill()
    .map((x, i) => i + 1)) {
    let key_name = "keys-" + k;
    if (element(key_name).textContent.toLowerCase() == letter.toLowerCase()) {
      element(key_name).style.animation = "keys-button-press 0.1s 1";
      setTimeout(function () {
        element(key_name).style.animation = "";
      }, 100);
      return;
    }
  }

  if (element("keys-middle").textContent.toLowerCase() == letter.toLowerCase()) {
    element("keys-middle").style.animation = "keys-button-middle-press 0.1s 1";
    setTimeout(function () {
      element("keys-middle").style.animation = "";
    }, 100);
  }
}

// Hacer que un botón de navegación parpadee.
function simulateNavPress(button_name) {
  let pressed = element(button_name);
  pressed.style.animation = "nav-button-press 0.1s 1";
  setTimeout(function () {
    pressed.style.animation = "";
  }, 100);
}

// Agregar letra a la entrada.
function addLetterEntry(letter) {
  let MAX_ENTRY_LETTERS = 17;
  let holder = element("entry-container-holder");
  if (holder.childElementCount < MAX_ENTRY_LETTERS) {
    let node = document.createElement("span");
    if (window.game.pangram.includes(letter.toUpperCase())) {
      node.classList.add("highlight");
    } else if (
      !window.game.pangram.toUpperCase().includes(letter.toUpperCase())
    ) {
      node.classList.add("invalid");
    }
    node.textContent = letter.toUpperCase();
    holder.appendChild(node);
  }
  rescaleLetterEntry();
}

// Eliminar letra de la entrada.
function removeLetterEntry() {
  let current = element("entry-container-holder");
  if (current.childElementCount > 0) {
    current.removeChild(current.lastChild);
  }
  rescaleLetterEntry();
}

// Cambiar la escala del ancho del texto de entrada.
function rescaleLetterEntry() {
  const MAX_SIZE = 1.7;
  const STEP = 0.1;
  let current_size = MAX_SIZE;

  let container = element("entry-container");
  let holder = element("entry-container-holder");
  holder.style.fontSize = MAX_SIZE + "em";
  if (holder.offsetWidth >= container.offsetWidth) {
    while (holder.offsetWidth >= container.offsetWidth) {
      current_size -= STEP;
      holder.style.fontSize = current_size + "em";
    }
  }
}

// Obtener la palabra de la entrada agregando letras.
function getWordEntry() {
  let combined = "";
  for (elem of element("entry-container-holder").children) {
    combined += elem.textContent;
  }
  return combined;
}

// Borrar letras de la entrada. Devuelve la palabra que estaba allí.
function clearEntry() {
  let word = getWordEntry();
  element("entry-container-holder").textContent = ""; // borra subyacentes.
  rescaleLetterEntry();
  return word;
}

// Configure el teclado en pantalla. 
function setUpScreenKeys(letters, reset_middle) {
  // Mezclar las letras y conviértelas en un conjunto 
  letters = letters.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = letters[i];
    letters[i] = letters[j];
    letters[j] = temp;
  }
  letters = new Set(letters);

  for (k of Array(6)
    .fill()
    .map((x, i) => i + 1)) {
    let key_name = "keys-" + k;
    element(key_name).style.color = "#00000000";
  }

  if (reset_middle) {
    element("keys-middle").style.color = "#00000000";
  }

  setTimeout(function () {
    let key_num = 1;
    for (letter_loop of letters) {
      let letter = letter_loop; // declarar un bucle para permitir el cierre.
      if (letter == letter.toUpperCase()) {
        if (reset_middle) {
          let km = element("keys-middle");
          km.textContent = letter.toUpperCase();
          km.style.color = "var(--color-keys-button-middle)";
          km.onclick = function () {
            addLetterEntry(letter);
          };
        }
      } else {
        let k = element("keys-" + key_num);
        k.textContent = letter.toUpperCase();
        k.style.color = "var(--color-black)";
        k.onclick = function () {
          addLetterEntry(letter);
        };
        key_num += 1;
      }
    }
  }, 300);
}

// Teclas de pantalla aleatorias.
function shuffleScreenKeys() {
  setUpScreenKeys(window.game.pangram, false);
  element("button-shuffle").disabled = true;

  setTimeout(function () {
    element("button-shuffle").disabled = false;
  }, 500);
}

// Introducir la palabra.
function enterWord() {
  let required_letter = element("keys-middle").textContent;
  let entered = clearEntry();

  // Compruebar si la palabra es demasiado corta.
  if (entered.length < 4) {
    showMessage("Poucas letras", 0);
    return;
  }

  // Verificar si la letra del medio está presente.
  if (!entered.toUpperCase().includes(required_letter)) {
    showMessage("Falta a letra do centro", 0);
    return;
  }

  // Compruebar si hay letras no válidas.
  for (letter of entered.toUpperCase()) {
    if (!window.game.pangram.toUpperCase().includes(letter.toUpperCase())) {
      showMessage("Malas letras", 0);
      return;
    }
  }

  // Compruebar si es una palabra válida.
  if (
    !window.game.words
      .map((x) => x.toUpperCase())
      .includes(entered.toUpperCase())
  ) {
    showMessage("A palabra no ta no diccionario", 0);
    return;
  }

  // Comprobar si está repetida.
  if (window.game.entered.includes(entered.toUpperCase())) {
    showMessage("Xa atopada", 0);
    return;
  }

  entered_score = getScore(entered);
  if (hmm() && entered.toLowerCase() == "Riopedre") {
    showMessage("--------", 2);
  } else {
    showMessage("+" + entered_score, isPangram(entered) ? 2 : 1);
  }
  window.game.current_score += entered_score;
  addWordToEntered(entered);
  changeProgress(window.game.current_score);
}

// Configurar las funciones de los botones.
function setUpButtonFunctions() {
  element("button-delete").onclick = removeLetterEntry;
  element("button-shuffle").onclick = shuffleScreenKeys;
  element("button-enter").onclick = enterWord;
}

// Desenfocar o enfocar elementos de fondo.
function setBlur(make_blurry) {
  window.game.popup_active = make_blurry;
  if (make_blurry) {
    element("header").classList.add("blur");
    element("container").classList.add("blur");
  } else {
    element("header").classList.remove("blur");
    element("container").classList.remove("blur");
  }
}

// Configurar la clasificación en la ventana emergente de progreso.
function setUpProgressPopup() {
  let ranking = element("progress-popup-ranking");
  let max_score = window.game.total_score;
  ranking.textContent = ""; // Borra subyacentes
  for (i of Array(LEVEL_PERCENTS.length)
    .fill()
    .map((x, i) => i)) {
    let elem = document.createElement("li");
    if (hmm()) {
      elem.textContent =
      LEVEL_NAMES[i].substring(1) +
      " (" +
      Math.floor(LEVEL_PERCENTS[i] * max_score) +
      " points)";
      let boldy = document.createElement("b");
      boldy.textContent = LEVEL_NAMES[i].substring(0,1);
      elem.insertBefore(boldy, elem.firstChild);
    } else {
      elem.textContent =
      LEVEL_NAMES[i] +
      " (" +
      Math.floor(LEVEL_PERCENTS[i] * max_score) +
      " points)";
    }
    ranking.insertBefore(elem, ranking.firstChild);
  }
}

// Mostrar ventana emergente de progreso.
function showProgressPopup() {
  element("progress-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideProgressPopup;
  setBlur(true);
}

// Ocultar ventana emergente de progreso.
function hideProgressPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("progress-popup").classList.add("hidden");
  setBlur(false);
}

// Configurar la ventana emergente.
function setUpAboutPopup() {
  if (hmm()) {
    element("popup-content-text-hmm").textContent = " with a special exception once a year";
    element("name-hmm").classList.add("bold");
    element("explanation-hmm").textContent = " Yes, even today.";
  } else {
    element("popup-content-text-hmm").textContent = "";
    element("explanation-hmm").textContent = "";
  }
}

// Mostrar la ventana emergente.
function showAboutPopup() {
  element("about-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideAboutPopup;
  setBlur(true);
}

// Ocultar la ventana emergente.
function hideAboutPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("about-popup").classList.add("hidden");
  setBlur(false);
}

// Configurar la ventana emergente anterior.
function setUpPrevPopup() {
  // Cargar las palabras de ayer, si existen.
  let prev_entered_array = getCookie(-1);
  let prev_entered = new Set(prev_entered_array);
  if (prev_entered.size != 0) {
    element("popup-content-text-entered").classList.remove("hidden");
  }

  // Muestra el pangrama.
  let prev_pangram = getTargetPangram(window.game.data, -1);
  let prev_pangram_set = new Set(prev_pangram);
  let prev_pangram_array = Array.from(prev_pangram_set);
  prev_pangram_array.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  let prev_letters_container = element("prev-letters-container");
  prev_letters_container.textContent = ""; // clears content.
  for (letter of prev_pangram_array) {
    let elem = document.createElement("span");
    elem.classList.add("prev-entered-letter");
    if (letter == letter.toUpperCase()) {
      elem.classList.add("highlight");
    }
    elem.textContent = letter.toUpperCase();
    prev_letters_container.appendChild(elem);
  }

  // Configurar el total de palabras y puntos.
  let prev_words = getWords(window.game.data, prev_pangram);
  prev_words.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  element("prev-stats-words").textContent = prev_words.length;
  let prev_points = getTotalScore(window.game.data, prev_pangram);
  element("prev-stats-points").textContent = prev_points;

  // Configurar palabras y puntos encontrados, si existen.
  if (prev_entered_array.length > 0) {
    element("prev-stats-words-found").textContent =
      prev_entered_array.length + " de ";
    element("prev-stats-points-found").textContent =
      getArrayScore(prev_entered_array) + " de ";
  }

  // Mostrar las palabras.
  let prev_words_container = element("prev-words-container");
  prev_words_container.textContent = ""; // borra el contenido.
  for (word of prev_words) {
    let elem = document.createElement("a");
    elem.classList.add("prev-entered-word");
    if (isPangram(word)) {
      elem.classList.add("highlight-background");
      elem.style.color = "var(--color-text-gray-highlight)";
    }
    if (prev_entered.has(word.toUpperCase())) {
      elem.classList.add("bolded");
    }
    elem.href = "https://axuntar.wordpress.com/" + word;
    elem.target = "_blank";
    elem.textContent = capitalizeInitial(word);
    prev_words_container.appendChild(elem);
  }
}

// Mostrar ventana emergente anterior.
function showPrevPopup() {
  element("prev-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hidePrevPopup;
  setBlur(true);
}

// Ocultar ventana emergente anterior.
function hidePrevPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("prev-popup").classList.add("hidden");
  setBlur(false);
}

// Mostrar ventana emergente haceca de.
function showResetPopup() {
  element("reset-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideResetPopup;
  setBlur(true);
}

// Ocultar ventana emergente haceca de..
function hideResetPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("reset-popup").classList.add("hidden");
  setBlur(false);
}

// Configurar ventana emergente de victoria.
function setUpCountdown(elem) {
  let target = getDateWithOffset(1);
  let countdown_interval = setInterval(function () {
    let now = new Date().getTime();
    let dt = target - now;

    let hours = Math.floor((dt % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((dt % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((dt % (1000 * 60)) / 1000);

    document.getElementById(elem).textContent =
      hours + "h " + minutes + "m " + seconds + "s";

    if (dt < 0) {
      clearInterval(countdown_interval);
      document.getElementById(elem).textContent =
        "un seg— ahora, e medianoite! Novo xogo";
      location.reload();
    }
  }, 1000);
}

// Configurar la ventana emergente cuenta atras
function setUpReturnPopup() {
  setUpCountdown("return-countdown-span");
}

// Mostrar ventana emergente de retorno.
function showReturnPopup() {
  element("return-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideReturnPopup;
  element("return-rank").textContent = LEVEL_NAMES[getRankNumber(window.game.current_score)];
  element("return-words").textContent = window.game.entered.length + (window.game.entered.length == 1 ? " palabra" : " palabras");
  element("return-points").textContent = window.game.current_score + (window.game.current_score == 1 ? " Punto" : " puntos");
  setBlur(true);
}

// Ocultar ventana emergente de retorno.
function hideReturnPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("return-popup").classList.add("hidden");
  setBlur(false);
}

// Configurar ventana emergente de victoria.
function setUpVictoryPopup() {
  setUpCountdown("victory-countdown-span");
}

// Mostrar ventana emergente de victoria.
function showVictoryPopup() {
  element("victory-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideVictoryPopup;
  element("victory-words").textContent = window.game.entered.length + " words";
  element("victory-points").textContent = window.game.current_score + " points";
  setBlur(true);
  window.game.show_victory_popup = false;
}

// Ocultar ventana emergente de victoria.
function hideVictoryPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("victory-popup").classList.add("hidden");
  setBlur(false);
}

// Configurar todas las ventanas emergentes.
function setUpAllPopup() {
  setUpCountdown("all-countdown-span");
  element("all-words").textContent = window.game.words.length + " words";
  element("all-points").textContent = window.game.total_score + " points";
}

// Mostrar todas las ventanas emergentes.
function showAllPopup() {
  element("all-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideAllPopup;
  setBlur(true);
  window.game.show_all_popup = false;
}

// Ocultar todas las ventanas emergentes.
function hideAllPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("all-popup").classList.add("hidden");
  setBlur(false);
}

// Alternar modo oscuro.
function toggleDarkMode() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    element("toggle-dark").textContent = "noite";
    setDarkCookie();
  } else {
    document.body.classList.add("dark");
    element("toggle-dark").textContent = "dia";
    setDarkCookie();
  }
}

// Cambia a modo oscuro.
function switchDarkMode(param) {
  if (param == "light") {
    document.body.classList.remove("dark");
    element("toggle-dark").textContent = "noite";
    setDarkCookie();
  } else if (param == "dark") {
    document.body.classList.add("dark");
    element("toggle-dark").textContent = "dia";
    setDarkCookie();
  }
}

// Debug de final
function doot() {
  console.log("doot");
}
