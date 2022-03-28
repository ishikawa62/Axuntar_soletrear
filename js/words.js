// Funciones de manipulación de matrices de las palabras.
// Constantes:
PANGRAM_SIZE = 7; // número de letras únicas para un pangrama.

// Comprobacion por si estoy tonto
function print(val) {
  console.log(val);
}

// hmm
function hmm() { return (new Date().getDate() == 25 && new Date().getMonth() == 9); }

// Carga la matriz y la devuélve.
function shuffleArray(arr, seed = 0) {
  let rng = new alea(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(rng() * i);
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// Desde el número entero N, mezclar (pseudoaleatoriamente) la matriz con los números 0
// hasta N-1.
function getShuffledNumberArray(n, seed = 0) {
  return shuffleArray(
    Array(n)
      .fill()
      .map((x, i) => i)
  );
}

// pangrama de destino en honor a calixto.
function getTargetPangram(data, offset = 0) {
  // hmm
  if (hmm() && offset == 0) {
    let letter_pick = shuffleArray(['a', 'c', 'i', 'l', 'o', 't', 'x'])[new Date().getFullYear() % 7];
    return capitalizeLetter('acilotx', letter_pick);
  }

  function countUpperCase(word) {
    num_uppercase = 0;
    for (letter of word) {
      if (letter == letter.toUpperCase()) {
        num_uppercase += 1;
      }
    }
    return num_uppercase;
  }

  // Elige un pangrama válido al azar. Garantizado que sea pseudoaleatorio que
  // recorre todas las opciones posibles cada [# num_choices] días.
  valid_pangrams = getAllValidPangrams(data);
  num_choices = valid_pangrams.reduce((acc, elem) => {
    return acc + countUpperCase(elem);
  }, 0);
  choice_arr = getShuffledNumberArray(num_choices);
  choice = choice_arr[getDayNumber(offset) % num_choices];

  // Recorra todas las combinaciones válidas de palabras y letras para encontrar la opción que obtuvimos.
  counter = 0;
  for (word of valid_pangrams) {
    for (letter of word) {
      if (letter == letter.toUpperCase()) {
        if (counter == choice) {
          return capitalizeLetter(word, letter);
        } else {
          counter += 1;
        }
      }
    }
  }

  print("Pangram finding has gone out of bounds!");
  return "Failure"; // etroceso, nunca debería suceder. Sin querer un pangrama. Habra que revisar el dic alguna vez.
}

// Con la matriz precargada, devuelve una matriz de todas las palabras en la matriz
// que 1) se puede hacer usando únicamente esas letras y 2) contiene todo en mayúsculas
// letras. Ojala.
function getWords(data, letters) {
  all_letters = new Set(letters.toLowerCase());
  required_letters = new Set(
    letters.split("").reduce((acc, elem) => {
      if (elem == elem.toUpperCase()) {
        return acc + elem.toLowerCase();
      } else {
        return acc;
      }
    }, "")
  );

  all_words = data.filter((word) => {
    word = word.toLowerCase();
    word_letters = new Set(word);
    for (letter of word_letters) {
      if (!all_letters.has(letter)) {
        return false;
      }
    }
    for (required_letter of required_letters) {
      if (!word_letters.has(required_letter)) {
        return false;
      }
    }
    return true;
  });

  // hmmmmm
  let hmm_array = Array.from(new Set(letters.toLowerCase()));
  hmm_array.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  if (hmm() && hmm_array.join('') == 'acilotx') {
    all_words.push('calixto');
  }
  return all_words;
}

// Con la matriz precargada, devuelve una matriz de todas las palabras en la matriz
// que 1) se puede hacer usando únicamente esas letras y 2) contiene todo en mayúsculas
// letras. Está vez si.
function getPangrams(data, letters) {
  words = getWords(data, letters);
  return getAllPangrams(words);
}

// Leer todos los pangramas de la matriz cargada.
function getAllPangrams(data) {
  return data.filter((word) => {
    word = word.toLowerCase();
    return new Set(word).size == PANGRAM_SIZE;
  });
}

// Obtener todos los pangramas válidos (es decir, aquellos que cumplen con los criterios para los pangramas de destino) en un determinado
// matriz de palabras.
function getAllValidPangrams(data) {
  pangrams = getAllPangrams(data);
  return pangrams.filter((word) => {
    return word != word.toLowerCase();
  });
}

// Comprobar si la palabra es un pangrama.
function isPangram(word) {
  return new Set(word.toUpperCase()).size == PANGRAM_SIZE;
}

// Puntuación de la palabra.
function getScore(word) {
  if (word.length == 4) {
    return 1;
  } else {
    score = word.length;
    if (isPangram(word)) {
      score += 7;
    }
    return score;
  }
}

// Suma de la puntuación de las palabras en la matriz.
function getArrayScore(words) {
  return words.reduce((acc, cur) => acc + getScore(cur), 0);
}

// Con los datos y el string, devuelve la puntuación total de todas las palabras que 1) se pueden formar
// usando las letras en el string, y 2) tener todas las letras en mayúsculas en el string.
function getTotalScore(data, letters) {
  words = getWords(data, letters);
  return total_score = words.reduce((acc, elem) => {
    word = elem.toLowerCase();
    return acc + getScore(word);
  }, 0);
}

// Con la palabra y la letra, escribir en mayúscula todas las instancias de esa letra en la palabra y
// minúsculas todas las demás letras.
function capitalizeLetter(word, letter) {
  return word.split("").reduce((acc, elem) => {
    if (elem.toLowerCase() == letter.toLowerCase()) {
      return acc + elem.toUpperCase();
    } else {
      return acc + elem.toLowerCase();
    }
  }, "");
}
