import React, { useState, useEffect } from "react";
import { iaTurn, updateQTable } from "./iaLogic";
import "./App.css";

const categories = ["Animales", "Frutas", "Países", "Colores"];
const WINNING_SCORE = 100;
const TIME_LIMIT = 40;

const App = () => {
  const [currentLetter, setCurrentLetter] = useState("");
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [iaAnswers, setIaAnswers] = useState({});
  const [score, setScore] = useState({ player: 0, ia: 0 });
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");
  const [timer, setTimer] = useState(TIME_LIMIT);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const startGame = () => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Letra aleatoria A-Z
    setCurrentLetter(letter);
    setPlayerAnswers({});
    setIaAnswers({});
    setGameOver(false);
    setIsTimerActive(true);
    setTimer(TIME_LIMIT);
  };

  const handleInputChange = (category, value) => {
    setPlayerAnswers((prev) => ({ ...prev, [category]: value }));
  };

  const endGame = () => {
    const iaResults = iaTurn(currentLetter, categories); // IA genera respuestas
    const { playerScore, iaScore } = calculateScore(playerAnswers, iaResults);
    const newPlayerScore = score.player + playerScore;
    const newIaScore = score.ia + iaScore;

    setIaAnswers(iaResults);
    setScore({ player: newPlayerScore, ia: newIaScore });
    setGameOver(true);

    // Actualizar la IA con recompensas
    updateQTable(currentLetter, categories, iaResults, playerScore > iaScore);

    // Verificar si hay ganador
    if (newPlayerScore >= WINNING_SCORE || newIaScore >= WINNING_SCORE) {
      setWinner(newPlayerScore >= WINNING_SCORE ? "Jugador" : "IA");
      setIsTimerActive(false); // Detener el temporizador
    } else {
      setLevel((prev) => prev + 1); // Avanzar al siguiente nivel
    }
  };

  const calculateScore = (player, ia) => {
    let playerScore = 0;
    let iaScore = 0;

    for (let category of categories) {
      const playerWord = player[category] || "";
      const iaWord = ia[category] || "";

      if (playerWord === "") {
        playerScore += 0; // No hay respuesta
      } else if (playerWord === iaWord) {
        playerScore += 5; // Repetido
      } else if (playerWord.startsWith(currentLetter)) {
        playerScore += 10; // Correcta
      }

      if (iaWord !== "" && iaWord.startsWith(currentLetter)) {
        if (iaWord === playerWord) {
          iaScore += 5; // Repetido
        } else {
          iaScore += 10; // Correcta
        }
      }
    }

    return { playerScore, iaScore };
  };

  // Temporizador
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      endGame(); // Si el tiempo se acaba, termina el juego
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  return (
    <div className="game-container">
      <h1>Tutti Frutti con IA</h1>
      <h2>Nivel: {level}</h2>
      <h3>Puntajes - Jugador: {score.player} | IA: {score.ia}</h3>
      <h3>Tiempo Restante: {timer} segundos</h3>

      {gameOver && winner ? (
        <div>
          <h2>¡{winner} gana el juego!</h2>
          <button onClick={() => window.location.reload()} className="restart-button">
            Reiniciar Juego
          </button>
        </div>
      ) : (
        <div>
          {currentLetter ? (
            <div>
              <h2>Letra: {currentLetter}</h2>
              <div className="answers-container">
                {categories.map((category) => (
                  <div key={category}>
                    <label>{category}:</label>
                    <input
                      type="text"
                      onChange={(e) => handleInputChange(category, e.target.value)}
                      disabled={gameOver}
                    />
                  </div>
                ))}
              </div>
              {!gameOver && (
                <button onClick={endGame} className="end-game-button">
                  Terminar Ronda
                </button>
              )}
              {gameOver && (
                <div>
                  <h3>Respuestas IA:</h3>
                  {categories.map((category) => (
                    <p key={category}>
                      {category}: {iaAnswers[category] || "Sin respuesta"}
                    </p>
                  ))}
                  <button onClick={startGame} className="restart-button">
                    Siguiente Nivel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={startGame} className="start-button">
              Iniciar Juego
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
