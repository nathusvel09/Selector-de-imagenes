// Almacenamiento persistente para respuestas de la IA (localStorage)
const getStoredAnswers = () => {
    const answers = localStorage.getItem("iaAnswers");
    return answers ? JSON.parse(answers) : {}; // Si no hay respuestas guardadas, devuelve un objeto vacío
  };
  
  const saveAnswers = (newAnswers) => {
    const storedAnswers = getStoredAnswers();
    const updatedAnswers = { ...storedAnswers, ...newAnswers }; // Unir las nuevas respuestas con las anteriores
    localStorage.setItem("iaAnswers", JSON.stringify(updatedAnswers)); // Guardar en localStorage
  };
  
  // Genera respuestas de la IA según la letra actual
  const iaTurn = (letter, categories) => {
    let iaResults = {};
  
    const storedAnswers = getStoredAnswers();
  
    categories.forEach((category) => {
      // Si ya hay una respuesta guardada para esa categoría, la usa
      if (storedAnswers[category] && storedAnswers[category].startsWith(letter)) {
        iaResults[category] = storedAnswers[category];
      } else {
        // Si no hay respuesta guardada, genera una respuesta nueva
        const word = generateAnswer(letter, category);
        iaResults[category] = word;
  
        // Guardar la nueva respuesta para futuras rondas
        saveAnswers({ [category]: word });
      }
    });
  
    return iaResults;
  };
  
  // Función para generar respuestas según la letra y categoría
  const generateAnswer = (letter, category) => {
    const predefinedWords = {
      Animales: ["Abeja", "Aguila", "Alce", "Ardilla"],
      Frutas: ["Aguacate", "Arándano", "Almendra", "Ananá"],
      Países: ["Argentina", "Australia", "África", "Alemania"],
      Colores: ["Amarillo", "Azul", "Almendra", "Almibar"],
    };
  
    return predefinedWords[category]?.find((word) => word.startsWith(letter)) || "Sin respuesta";
  };
  
  // Actualiza la Q-table (puedes usarla para hacer aprendizaje por refuerzo)
  const updateQTable = (letter, categories, iaResults, isPlayerWinner) => {
    // Aquí puedes implementar la lógica para actualizar la Q-table con la información del juego.
    console.log("Actualizando Q-table...", { letter, categories, iaResults, isPlayerWinner });
  };
  
  export { iaTurn, updateQTable };
  