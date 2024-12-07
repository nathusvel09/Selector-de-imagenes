import React, { useState, useEffect } from 'react';
import './App.css';

// Lista de palabras con sus categorías
const words = [
  { word: 'monstruo', category: 'animal' },
  { word: 'dragon', category: 'animal' },
  { word: 'fantasma', category: 'animal' },
  { word: 'vampiro', category: 'animal' },
  { word: 'tiburon', category: 'animal' },
  { word: 'zombie', category: 'animal' },
  { word: 'demonio', category: 'animal' },
  { word: 'espectro', category: 'animal' },
  { word: 'silla', category: 'objeto' },
  { word: 'television', category: 'objeto' },
  { word: 'computadora', category: 'objeto' },
  { word: 'lampara', category: 'objeto' },
  { word: 'pelota', category: 'objeto' },
  { word: 'reloj', category: 'objeto' },
  { word: 'mesa', category: 'objeto' },
  { word: 'luna', category: 'lugar' },
  { word: 'parque', category: 'lugar' },
  { word: 'ciudad', category: 'lugar' },
  { word: 'desierto', category: 'lugar' },
];

const App = () => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('');
  const [displayedWord, setDisplayedWord] = useState('');
  const [incorrectGuesses, setIncorrectGuesses] = useState([]);
  const [correctGuesses, setCorrectGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [monsterParts, setMonsterParts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [qTable, setQTable] = useState({}); // Tabla Q para aprendizaje por refuerzo
  useEffect(() => {
    const savedQTable = localStorage.getItem('qTable');
    if (savedQTable) {
      setQTable(JSON.parse(savedQTable));  // Cargar tabla Q desde localStorage
    }
  }, []);
  
  const startGame = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex].word;
    const wordCategory = words[randomIndex].category;
    setWord(randomWord);
    setCategory(wordCategory);
    setDisplayedWord('_ '.repeat(randomWord.length).trim());
    setIncorrectGuesses([]);
    setCorrectGuesses([]);
    setMonsterParts(0);
    setGameOver(false);
    setShowHint(false);
  };

  const handleGuess = (letter) => {
    if (gameOver || incorrectGuesses.includes(letter) || correctGuesses.includes(letter)) {
      return;
    }
  
    const button = document.querySelector(`.letter-button[data-letter="${letter}"]`);
  
    if (word.includes(letter)) {
      // La letra es correcta
      const newDisplayedWord = displayedWord.split(' ').map((char, index) => {
        return word[index] === letter ? letter : char;
      }).join(' ');
  
      setDisplayedWord(newDisplayedWord);
      setCorrectGuesses([...correctGuesses, letter]);
      button.classList.add('correct'); // Agrega la clase "correct"
      updateQTable(letter, true);
    } else {
      // La letra es incorrecta
      setIncorrectGuesses([...incorrectGuesses, letter]);
      setMonsterParts(monsterParts + 1);
      button.classList.add('incorrect'); // Agrega la clase "incorrect"
      updateQTable(letter, false);
    }
  
    // Verificar si se ha perdido o ganado el juego
    if (monsterParts + 1 === 6) {
      setGameOver(true);
    } else if (!displayedWord.includes('_')) {
      setGameOver(true);
    }
  };
  

  const getAISuggestion = () => {
    const remainingLetters = word.split('').filter((letter) => !correctGuesses.includes(letter));
    if (remainingLetters.length === 0) {
        alert('¡Ya has adivinado todas las letras correctamente!');
        return;
    }

    // Predicción inicial aleatoria para fomentar el aprendizaje
    const isRandom = Math.random() < 0.3; // 30% de predicciones aleatorias
    let letterToSuggest;

    if (isRandom) {
        letterToSuggest = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
    } else {
        // Sugerencia basada en valores de Q-Table
        letterToSuggest = remainingLetters.reduce((bestLetter, currentLetter) => {
            const currentValue = qTable[currentLetter] || 0;
            const bestValue = qTable[bestLetter] || 0;
            return currentValue > bestValue ? currentLetter : bestLetter;
        });
    }

    alert(`La IA sugiere adivinar la letra: ${letterToSuggest}`);
    return letterToSuggest; // Se sugiere una letra
};

const updateQTable = (letter, isCorrect) => {
  const newQTable = { ...qTable }; // Copia la tabla Q actual

  if (!newQTable[letter]) {
    newQTable[letter] = 0; // Asegura que la letra tenga un valor inicial de 0
  }

  const reward = isCorrect ? 1 : -1; // Recompensa (+1) o castigo (-1)
  const learningRate = 0.1; // Tasa de aprendizaje
  const discountFactor = 0.9; // Factor de descuento para futuros pasos

  newQTable[letter] = newQTable[letter] + learningRate * (reward + discountFactor * (qTable[letter] || 0) - newQTable[letter]);

  setQTable(newQTable); // Actualiza el estado con la nueva tabla Q
  localStorage.setItem('qTable', JSON.stringify(newQTable)); // Guardar tabla Q en localStorage
};


const endGame = () => {
    setGameOver(true);
    const errorRate = incorrectGuesses.length / (incorrectGuesses.length + correctGuesses.length);
    alert(`¡Has terminado el juego! Tasa de error de la IA: ${(errorRate * 100).toFixed(2)}%`);
};


  const drawMonster = () => {
    const parts = [
      '🧠', // Cabeza
      '👕', // Cuerpo
      '👖', // Piernas
      '👟', // Zapatos
      '👀', // Ojos
      '👽', // Detalles monstruosos
    ];
    return parts.slice(0, monsterParts).map((part, index) => <div key={index}>{part}</div>);
  };

  useEffect(() => {
    startGame();
  }, []);
  return (
    <div className="game-container">
      <h1>Juego de Ahorcando al Monstruo</h1>
      <p>¡Intenta adivinar la palabra!</p>
      <h2>{displayedWord}</h2>
      {!gameOver ? (
        <div>
          <p>Errores: {incorrectGuesses.join(', ')}</p>
          <p>Partes del monstruo: {monsterParts}</p>
          {showHint && <p><strong>Pista: </strong> Es un {category}.</p>}
          <button onClick={() => { setShowHint(true); getAISuggestion(); }} className="hint-button">Mostrar Pista</button>
          <div className="letter-buttons">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].map((letter) => (
              <button
                key={letter}
                data-letter={letter} // Identificador único para cada botón
                onClick={() => handleGuess(letter)}
                disabled={gameOver || incorrectGuesses.includes(letter) || correctGuesses.includes(letter)}
                className="letter-button"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2>{monsterParts === 6 ? '¡Perdiste!' : '¡Ganaste!'}</h2>
          <p>La palabra era: {word}</p>
          <button onClick={startGame} className="action-button">Empezar de nuevo</button>
          <button onClick={endGame} className="action-button">Terminar juego</button>
        </div>
      )}
      <div className="monster-drawing">{drawMonster()}</div>
    </div>
  );
};

export default App;
