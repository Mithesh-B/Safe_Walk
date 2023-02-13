"use strict";

const form = document.querySelector(".form");
const inputTitle = document.querySelector(".form__input--title");
const inputGender = document.querySelector(".form__input--gender");
const inputUsername = document.querySelector(".form__input--username");
const inputDate = document.querySelector(".form__input--date");
const inputAge = document.querySelector(".form__input--age");
const inputTime = document.querySelector(".form__input--time");
const inputDescription = document.querySelector(".form__input--description");
const content = document.querySelector(".content");
const about = document.querySelector(".about");
const image = document.querySelector(".center");

let latitude, longitude;
// geolocation
function getPosition(callback) {

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    
      callback([latitude, longitude]);
    },
    //if location denied use default location

    function (error) {

      if (error.code == error.PERMISSION_DENIED)

      callback([12.972442, 77.580643]);
    }
  );
}

let htmlForm;
let map;
let mapEvent;
let inputValues = [];

//leaflet.js library for 3rd party map

getPosition((coordinates) => {

  map = L.map("map").setView(coordinates, 11);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.on("click", function (mapEv) {

    mapEvent = mapEv;

    //show form
    form.classList.remove("hidden");
    inputTitle.focus();

    //hide text
    about.classList.add("hidden");
    image.classList.add("hidden");

   document.querySelector("footer").style.display = "none";

  });
});

image.addEventListener("click", function (e) {
  e.preventDefault();

  //show text
  about.classList.remove("hidden");
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  //create unique id

  const id = (Date.now() + "").slice(-10);
  const title = inputTitle.value;
  const date = inputDate.value;
  const { lat, lng } = mapEvent.latlng;

  //collect form data
  htmlForm = {
    title: inputTitle.value,
    date: inputDate.value,
    username: inputUsername.value,
    age: inputAge.value,
    gender: inputGender.value,
    description: inputDescription.value,
    time: inputTime.value,
    id: id,
    coords: [lat, lng],
  };

  const dateFormat = date.split("-").reverse().join("-");

  //display marker via leaflet.js library
  const heatPoints = [[lat, lng]];
  
  L.heatLayer(heatPoints, {
    radius: 25,
    
   
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "popup",
      })
    )
    .setPopupContent(`${title}, ${date}`)
    .openPopup();

  //load form data to the dom
  function renderWorkout(input) {
    let html = `
      <div class="info" data-id="${input.id}">
        <h2>${input.title} </h2><span class= "info_dt"> Date:${dateFormat}, ${input.time} </span><br>
          <h3 class="info_name">${input.username}, ${input.age}</h3> <h3 class="info_gen">Gender: ${input.gender} </h3><br>
            <p>${input.description}</p>
      </div>`;

    form.insertAdjacentHTML("afterend", html);
  }

  form.classList.add("hidden");
  renderWorkout(htmlForm);

  inputValues.push(htmlForm);

  //make rendered value clickable and pan map to clicked value
  content.addEventListener("click", (e) => {

    //finding closest class to content
    const closestContent = e.target.closest(".info");
    
    if (!closestContent) return;
    //checking id of markup === id of info
    const info = inputValues.find(
      (data) => data.id === closestContent.dataset.id
    );

    //panning map to the clicked id
    map.setView(info.coords, 18, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  });

  //clear input from form
  inputAge.value =
    inputDate.value =
    inputDescription.value =
    inputGender.value =
    inputTime.value =
    inputTitle.value =
    inputUsername.value =
      "";
});
