import { IMAGENET_CLASSES } from "./imagenet_classes.js";

$("#image-selector").change(function () {
  let reader = new FileReader();
  reader.onload = function () {
    let dataURL = reader.result;
    $("#selected-image").attr("src", dataURL);
    $("#selected-image").attr("width", 1000);
    $("#selected-image").attr("height", 1000);
    $("#predict-list").empty();
  };
  let file = $("#image-selector").prop("files")[0];
  reader.readAsDataURL(file);
});

let model;
(async function () {
  model = await tf.loadModel(
    "http://localhost:3000/tfjs-models/MyModel/model.json"
  );
  $(".progress-bar").hide();
})();

$("#predict-button").click(async function () {
  let image = $("#selected-image").get(0);
  let tensor = tf
    .fromPixels(image)
    .resizeNearestNeighbor([256, 256])
    .toFloat()
    .expandDims();
  let predicitions = await model.predict(tensor).data();
  let top5 = Array.from(predicitions)
    .map(function (p, i) {
      return {
        probability: p,
        className: IMAGENET_CLASSES[i],
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 3);

  $("#predict-list").empty();
  top5.forEach(function (p) {
    $("#predict-list").append(
      `<li>${p.className}: ${p.probability.toFixed(6)}</li>`
    );
  });

  console.log("Audio/" + top5[0].className.split(" ")[0] + ".mp3");
  var audio = new Audio("Audio/" + top5[0].className.split(" ")[0] + ".mp3");
  audio.play();
});
