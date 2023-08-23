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

function formatDate(apiDate) {
  const dateObj = new Date(apiDate);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

let userForm;

function fetchUserData() {
  return new Promise((resolve, reject) => {
    fetch("https://tired-wetsuit-hare.cyclic.cloud/allUserData")
      .then((response) => response.json())
      .then((data) => {
        // Process the fetched data
        userForm = data;

        // Display markers via leaflet.js library
        const heatPoints = data.map((data) => [
          data.coordinates[0],
          data.coordinates[1],
        ]);
        L.heatLayer(heatPoints, {
          radius: 25,
        }).addTo(map);

        data.forEach((data) => {
          const marker = L.marker([data.coordinates[0], data.coordinates[1]])
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
            .setPopupContent(`${data.title} on ${formatDate(data.date)}`);
          marker.openPopup();
        });

        resolve(); // Resolve the promise when data is fetched and processed
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        reject(error); // Reject the promise if an error occurs
      });
  });
}

// Call the function to initiate the fetching process
fetchUserData();

function postData(data) {
  fetch("https://tired-wetsuit-hare.cyclic.cloud/userData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log("Data sent successfully:", responseData);
    })
    .catch((error) => {
      console.error("Error sending data:", error);
    });
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
    coordinates: [lat, lng],
  };

  //send post req
  postData(htmlForm);
  // Call the function to initiate the fetching process after post request is done

  //load form data to the dom
  function renderWorkout(input) {
    let html = `
      <div class="info" data-id="${input?._id}">
        <h2>${input.title} </h2><span class= "info_dt"> Date:${formatDate(
      input.date
    )}, ${input.time} </span><br>
          <h3 class="info_name">${input.username}, ${
      input.age
    }</h3> <h3 class="info_gen">Gender: ${input.gender} </h3><br>
            <p>${input.description}</p>
      </div>`;

    // Insert the generated HTML content after the form element
    form.insertAdjacentHTML("afterend", html);
  }

  form.classList.add("hidden");

  fetchUserData().then(() => {
    const infoDivs = content.querySelectorAll(".info");
    infoDivs.forEach((div) => {
      div.remove();
    });

    // Iterate through userForm data and call renderWorkout for each entry
    console.log(userForm);
    if (userForm) {
      userForm.forEach((data) => {
        renderWorkout(data);
      });
    } else {
      console.log("User form data is not available yet.");
    }
  });

  //make rendered value clickable and pan map to clicked value
  content.addEventListener("click", (e) => {
    //finding closest class to content
    const closestContent = e.target.closest(".info");

    if (!closestContent) return;

    const clickedId = closestContent.dataset.id;

    // Check if the clickedId matches any id in inputValues
    const info = userForm?.find((data) => data._id === clickedId);
    console.log("Found info:", info);

    //panning map to the clicked id
    map.setView(info.coordinates, 18, {
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
