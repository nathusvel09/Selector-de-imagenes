import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "./App.css"; // Importar estilos

const categories = ["Sun", "Flower", "Cloud", "Tree"];
const canvasSize = 300;
tf.setBackend('cpu');

const App = () => {
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const initModel = () => {
      const m = tf.sequential();
      m.add(tf.layers.dense({ inputShape: [canvasSize * canvasSize], units: 128, activation: "relu" }));
      m.add(tf.layers.dense({ units: categories.length, activation: "softmax" }));
      m.compile({ optimizer: "adam", loss: "categoricalCrossentropy", metrics: ["accuracy"] });
      setModel(m);
    };
    initModel();
  }, []);

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  };

  const predictDrawing = async () => {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const input = tf.tensor(imageData.data, [canvasSize, canvasSize, 4])
      .mean(2)
      .div(255)
      .flatten()
      .reshape([1, canvasSize * canvasSize]);

    const prediction = model.predict(input);
    const predictionArray = await prediction.array();
    const predictedCategory = categories[predictionArray[0].indexOf(Math.max(...predictionArray[0]))];

    setPredictions(predictedCategory);
  };

  const trainModel = async (correctCategory) => {
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const input = tf.tensor(imageData.data, [canvasSize, canvasSize, 4])
      .mean(2)
      .div(255)
      .flatten()
      .reshape([1, canvasSize * canvasSize]);

    const label = tf.oneHot([categories.indexOf(correctCategory)], categories.length);

    await model.fit(input, label, {
      epochs: 5,
      callbacks: {
        onBatchEnd: (_, logs) => {
          setProgress(logs.loss.toFixed(4));
        },
      },
    });
  };

  return (
    <div className="container">
      <h1>Doodle Classifier</h1>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
      <div>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={predictDrawing}>Predict</button>
      </div>
      <h2 className="prediction">Prediction: {predictions}</h2>
      {predictions && (
        <div className="correction-buttons">
          <p>¿Es correcto?</p>
          {categories.map((cat) => (
            <button key={cat} onClick={() => trainModel(cat)}>
              {cat}
            </button>
          ))}
        </div>
      )}
      <p className="progress">Training Progress: {progress > 0 ? `${progress}%` : "Not trained yet"}</p>
    </div>
  );
};

export default App;
