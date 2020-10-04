let myMap;
let canvas;
var fireLocations = [];
const mappa = new Mappa('Leaflet');
const option = {
  lat: 0,
  lng: 0,
  zoom: 2,
  style: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
  // style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

// if (navigator.onLine) {
//   var s = document.createElement('script');
//   s.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.16/p5.min.js';
//   document.head.append(s);
//   var s = document.createElement('script');
//   s.src = 'https://cdn.jsdelivr.net/npm/mappa-mundi@0.0.4';
//   document.head.appendChild(s);
// } else
//   alert('No connection!');

function setup() {
  canvas = createCanvas(1300, 640);
  myMap = mappa.tileMap(option);
  myMap.overlay(canvas);

  fill(200, 100, 100);

  // Only redraw the point when the map changes and not every frame.
  myMap.onChange(drawPoint);
}
function draw() {

}

function drawPoint() {
  clear();
  // var arr = [[1, 50], [50, 23]];
  for (i = 0; i < fireLocations.length; i++) {
    const x = myMap.latLngToPixel(fireLocations[i][1], fireLocations[i][0]);
    ellipse(x.x, x.y, 20, 20);
  }
}


// function drawPoint(x,y) {
//   // clear();
//   // var arr = [[1, 50], [50, 23]];
//   const nigeria = myMap.latLngToPixel(11.396396, 5.076543);
//   ellipse(x, y, 20, 20);
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 1: load data or create some data 
var dataSet = data;
var Req = req;

// console.log(dataSet);
// Step 2: set your neural network options
const options = {
  inputs: ['latitude',
    'longitude',
    'brightness',
    'daynight',
    'bright_t31',
    // 'acq_time',  
    'frp'
  ],
  outputs: ['confidence'],
  task: 'regression',
  learningRate: 0.18,
  hiddenUnits: 25,
    debug: 'true'
}

// Step 3: initialize your neural network
const nn = ml5.neuralNetwork(options);

// Step 4: add data to the neural network
// latitude  longitude brightness  daynight  bright_t31  acq_time  frp confidence

// used for training the model not needed because we already trained it
// dataSet.forEach(item => {
//   const inputs = {
//     latitude: item.latitude, 
//     longitude: item.longitude, 
//     brightness: item.brightness,
//      daynight: item.daynight=='N'?1:2,
//     bright_t31:item.bright_t31,
//     // acq_time:item.acq_time,
//     frp:item.frp
//   };
//   const output = {
//     confidence: item.confidence
//   };
//   nn.addData(inputs, output);
// });

// Step 5: normalize your data;
// nn.normalizeData();
// console.log(nn);

// Step 6: train your neural network
// const trainingOptions = {
//   epochs: 50,
//   batchSize: 5000,
// }
// nn.train(trainingOptions,whileTraining, finishedTraining);
// function whileTraining(epoch, loss) {
//   console.log(loss);
// }

// Step 7: use the trained model

// we have a trained model so we just load it
const modelDetails = {
  model: 'model/model.json',
  metadata: 'model/model_meta.json',
  weights: 'model/model.weights.bin'
}
nn.load(modelDetails, modelLoaded);
function modelLoaded() {
  // continue on your neural network journey
  // use nn.classify() for classifications or nn.predict() for regressions
  console.log("Loading model finished!");

  classify();
}

function finishedTraining() {
  console.log("finishedTraining");
  nn.save();
  classify();
}

// Step 8: make a classification
var x,y;
function classify() {
  var c = 0;
  while(c<3000){
    item = Req[c++];
    const inputs = {
      latitude: item.latitude,
      longitude: item.longitude,
      brightness: item.brightness,
      daynight: item.daynight == 'N' ? 1.0 :2.0,
      bright_t31: item.bright_t31,
      // acq_time:item.acq_time,
      frp: item.frp
    };
    x  = item.longitude;
    y = item.latitude;
    const t = [x,y];
     console.log(x + " "  + y);
    var z=  nn.predict(inputs, handleResults);
      z.then(function(result) {
      if(result[0].value>=80){
          console.log(c + " "  + t + " " +result[0].value);
             fireLocations.push(t);
           }
      
          });
  }

}
// Step 9: define a function to handle the results of your classification
function handleResults(error, result) {

  if (error) {
    console.error(error);
    return;
  }

  // if (result[0].value >= 60) {
  //   var t = [x,y];
  //   fireLocations.push(t);
  // }
}
