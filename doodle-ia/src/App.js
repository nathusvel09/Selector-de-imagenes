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
  
    if (word.includes(letter)) {
      const newDisplayedWord = displayedWord.split(' ').map((char, index) => {
        return word[index] === letter ? letter : char;
      }).join(' ');
  
      setDisplayedWord(newDisplayedWord);
      setCorrectGuesses([...correctGuesses, letter]);
      updateQTable(letter, true);
    } else {
      setIncorrectGuesses([...incorrectGuesses, letter]);
      setMonsterParts(monsterParts + 1);
      updateQTable(letter, false);
    }
  
    // Verifica si se alcanzaron los 6 errores, lo que significa que el jugador ha perdido
    if (monsterParts + 1 === 6) {
      setGameOver(true);  // El jugador pierde
    } else if (!displayedWord.includes('_')) {
      setGameOver(true);  // El jugador gana
    }
  };
  

  const updateQTable = (letter, isCorrect) => {
    const newQTable = { ...qTable };  // Copia la tabla Q actual
  
    if (!newQTable[letter]) {
      newQTable[letter] = 0; // Inicializa el valor de Q para esa letra si no existe
    }
  
    const reward = isCorrect ? 1 : -1;  // +1 si es correcta, -1 si es incorrecta
    newQTable[letter] += reward;  // Actualiza el valor Q para esa letra
  
    setQTable(newQTable);  // Actualiza el estado con la nueva tabla Q
    localStorage.setItem('qTable', JSON.stringify(newQTable));  // Guardar tabla Q en localStorage
  };
  

  const getAISuggestion = () => {
    const remainingLetters = word.split('').filter((letter) => !correctGuesses.includes(letter));
    if (remainingLetters.length === 0) {
      alert('¡Ya has adivinado todas las letras correctamente!');
      return;
    }
    const letterToSuggest = remainingLetters.reduce((bestLetter, currentLetter) => {
      const currentValue = qTable[currentLetter] || 0;
      const bestValue = qTable[bestLetter] || 0;
      return currentValue > bestValue ? currentLetter : bestLetter;
    });
    alert(`La IA sugiere adivinar la letra: ${letterToSuggest}`);
  };

  const endGame = () => {
    setGameOver(true);
    alert('¡Has terminado el juego!');
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
              <button key={letter} onClick={() => handleGuess(letter)} disabled={gameOver} className="letter-button">
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
