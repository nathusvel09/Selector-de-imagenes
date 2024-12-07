import * as tf from '@tensorflow/tfjs';

let model;

export const createModel = () => {
  model = tf.sequential();

  // Entrada: vector con 26 letras (0 o 1) + longitud de palabra
  model.add(tf.layers.dense({ inputShape: [27], units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Salida: probabilidad de la letra

  model.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
};

export const trainModel = async (data, labels, epochs = 50) => {
  const xs = tf.tensor2d(data); // Datos de entrada
  const ys = tf.tensor1d(labels); // Etiquetas (0 o 1)

  const history = await model.fit(xs, ys, {
    epochs,
    batchSize: 32,
    verbose: 1,
  });

  console.log('Entrenamiento finalizado. Errores por epoch:', history.history.loss);
  return history;
};

export const predict = (input) => {
  const tensorInput = tf.tensor2d([input]);
  return model.predict(tensorInput).array();
};
