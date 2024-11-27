import React, { useState, useEffect } from 'react';
import './App.css';

// Lista de palabras con sus categorías
const words = [
  { word: 'monstruo', category: 'animal' },
  { word: 'dragón', category: 'animal' },
  { word: 'fantasma', category: 'animal' },
  { word: 'vampiro', category: 'animal' },
  { word: 'tiburón', category: 'animal' },
  { word: 'zombie', category: 'animal' },
  { word: 'demonio', category: 'animal' },
  { word: 'espectro', category: 'animal' },
  { word: 'silla', category: 'objeto' },
  { word: 'televisión', category: 'objeto' },
  { word: 'computadora', category: 'objeto' },
  { word: 'lámpara', category: 'objeto' },
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
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [qTable, setQTable] = useState({}); // Tabla Q para aprendizaje por refuerzo

  // Función para iniciar el juego con una palabra aleatoria
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

  // Función para manejar la selección de letras
  const handleGuess = (letter) => {
    if (gameOver || incorrectGuesses.includes(letter) || correctGuesses.includes(letter)) {
      return;
    }

    if (word.includes(letter)) {
      const newDisplayedWord = displayedWord.split(' ').map((char, index) => {
        return word[index] === letter ? letter : char;
      }).join(' ');

      setDisplayedWord(newDisplayedWord);
      setCorrectGuesses([...correctGuesses, letter]);

      // Actualizar tabla Q con recompensa positiva
      updateQTable(letter, true);
    } else {
      setIncorrectGuesses([...incorrectGuesses, letter]);
      setMonsterParts(monsterParts + 1);

      // Actualizar tabla Q con penalización
      updateQTable(letter, false);
    }

    if (!displayedWord.includes('_')) {
      setGameOver(true);
      setScore(score + 1);
    } else if (monsterParts === 6) {
      setGameOver(true);
    }
  };

  // Función para actualizar la tabla Q
  const updateQTable = (letter, isCorrect) => {
    const newQTable = { ...qTable };

    if (!newQTable[letter]) {
      newQTable[letter] = 0; // Inicializar valor Q si no existe
    }

    // Recompensa por elección correcta, penalización por incorrecta
    const reward = isCorrect ? 1 : -1;
    newQTable[letter] += reward;

    setQTable(newQTable);
  };

  // Función para obtener una sugerencia de letra faltante
  const getAISuggestion = () => {
    // Filtramos las letras que ya fueron adivinadas correctamente
    const remainingLetters = word.split('').filter((letter) => !correctGuesses.includes(letter));

    if (remainingLetters.length === 0) {
      alert('¡Ya has adivinado todas las letras correctamente!');
      return;
    }

    // Elegir la letra con la mejor "recompensa" en la tabla Q
    const letterToSuggest = remainingLetters.reduce((bestLetter, currentLetter) => {
      const currentValue = qTable[currentLetter] || 0;
      const bestValue = qTable[bestLetter] || 0;
      return currentValue > bestValue ? currentLetter : bestLetter;
    });

    alert(`La IA sugiere adivinar la letra: ${letterToSuggest}`);
  };

  // Función para terminar el juego (reiniciar)
  const endGame = () => {
    setGameOver(true);
    alert('¡Has terminado el juego!');
  };

  // Dibuja las partes del monstruo
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
      <h1>Juego de Ahorcado: Monstruo</h1>
      <p>¡Intenta adivinar la palabra!</p>
      <h2>{displayedWord}</h2>
      {!gameOver ? (
        <div>
          <p>Errores: {incorrectGuesses.join(', ')}</p>
          <p>Partes del monstruo: {monsterParts}</p>
          {showHint && <p><strong>Pista: </strong> Es un {category}.</p>}
          <button onClick={() => { setShowHint(true); getAISuggestion(); }}>Mostrar Pista</button>
          <div>
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].map((letter) => (
              <button key={letter} onClick={() => handleGuess(letter)} disabled={gameOver}>
                {letter}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2>{monsterParts === 6 ? '¡Perdiste!' : '¡Ganaste!'}</h2>
          <p>La palabra era: {word}</p>
          <button onClick={startGame}>Empezar de nuevo</button>
          <button onClick={endGame}>Terminar juego</button>
        </div>
      )}
      <div className="monster-drawing">{drawMonster()}</div>
    </div>
  );
};

export default App;
