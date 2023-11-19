apiKey = "49462ab2917283a398fb361a32c549a4";
const citySearchInput = document.querySelector("#city-search");
const searchButton = document.getElementById("search-button");
const currentWeather = document.getElementById("current-weather");
const fiveDayForecast = document.getElementById("five-day-forecast");
const cityList = document.getElementById("list-items");
let city = null;
let recentArray = [];

// INITIALIZATION - Checks for Location and Local Storage
firstLoad();
localStorageForRecent();

// MAIN EXECTION
searchButton.addEventListener("click", function (event) {
  city = citySearchInput.value;
  updatePage();
  citySearchInput.value = "";
});

// Use userlocation for first load
function firstLoad() {
  getUserLocation();
}

function getUserLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.length > 0) {
              city = data[0].name;
              return getWeather(lat, lon);
            } else {
              throw new Error("City not found");
            }
          })
          .then((weatherData) => {
            if (weatherData) {
              updateUI(weatherData);
            }
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      },
      function (error) {
        console.error("Error Code = " + error.code + " - " + error.message);
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}


function updatePage() {
  let weatherData = openWeatherAPICalls(city).then((weatherData) => {
    updateUI(weatherData);
  });
  if (!recentArray.includes(city)) {
    recentArray.push(city);
    addRecentSearch();
  }
}

function localStorageForRecent() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    if (localStorage.key(i).includes("recentSearch:")) {
      let key = localStorage.key(i);
      let value = localStorage.getItem(key);
      let recentCity = document.createElement("li");
      recentCity.textContent = value;

      recentCity.addEventListener("click", function () {
        citySearchInput.value = this.textContent;
        city = citySearchInput.value;
        updatePage();
      });

      document.getElementById("list-items").appendChild(recentCity);
      recentArray.push(value);
    }
  }
}

//API FUNCTIONS
function geocodeCity(city) {
  let geocodeCityURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  return fetch(geocodeCityURL)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
      } else {
        console.error("City not found");
        removeCityFromRecent(city);
        alert("City not found");
        return null;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return null;
    });
}

function getWeather(lat, lon) {
  let apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  return fetch(apiURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      localStorage.setItem(`Weather Data: ${city}`, `${JSON.stringify(data)}`);
      return data;
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}

function openWeatherAPICalls(city) {
  return geocodeCity(city).then(function (coords) {
    if (coords) {
      let weatherData = getWeather(coords.lat, coords.lon);

      return weatherData;
    } else {
      console.log("Error: City not found");
      return null;
    }
  });
}
// END OF API FUNCTIONS

function removeCityFromRecent(cityName) {
  let cityElements = cityList.getElementsByTagName("li");
  for (let cityElement of cityElements) {
    if (cityElement.textContent === cityName) {
      cityList.removeChild(cityElement);
      break;
    }
  }

  let recentIndex = recentArray.indexOf(cityName);
  if (recentIndex !== -1) {
    recentArray.splice(recentIndex, 1);
    localStorage.removeItem(`recentSearch: ${cityName}`);
  }
}

function updateCurrentWeather(data) {
  if (data) {
    let formattedDescription = capitalizeWords(data.current.weather[0].description);
    let formattedDate = new Date(data.current.dt * 1000).toLocaleDateString("en-US");
    document.getElementById("location-date").textContent = `${city} ${formattedDate} - ${formattedDescription}`;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
    document.getElementById("temperature").textContent = `${data.current.temp}°F`;
    document.getElementById("wind").textContent = `${data.current.wind_speed} MPH`;
    document.getElementById("humidity").textContent = `${data.current.humidity} %`;
  } else {
    console.log("No data available to update current weather");
  }
}

function update5DayForecast(data) {
  let formattedDate = new Date(data.current.dt * 1000).toLocaleDateString("en-US");
  document.getElementById("five-day-forecast").classList.remove("hide");
  for (let i = 1; i <= 5; i++) {
    let forecastDiv = document.getElementById(`forecast-${i}`);
    if (forecastDiv) {
      document.getElementById(`t-${i}`).textContent = `Temp: ${data.daily[i].temp.day}°F`;
      document.getElementById(`w-${i}`).textContent = `Wind: ${data.daily[i].wind_speed} MPH`;
      document.getElementById(`h-${i}`).textContent = `Humidty: ${data.daily[i].humidity} %`;
    }
  }
}

function updateUI(data) {
  updateCurrentWeather(data);
  update5DayForecast(data);
}

function addRecentSearch() {
  let recentCity = document.createElement("li");
  recentCity.textContent = city;
  recentCity.addEventListener("click", function () {
    city = this.textContent;
    updatePage();
  });
  document.getElementById("list-items").insertBefore(recentCity, cityList.childNodes[0]);
  localStorage.setItem(`recentSearch: ${city}`, `${city}`);
}

function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
