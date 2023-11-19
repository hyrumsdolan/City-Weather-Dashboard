document.addEventListener("DOMContentLoaded", function () {
  apiKey = "49462ab2917283a398fb361a32c549a4";
  const citySearchInput = document.querySelector("#city-search");
  const searchButton = document.getElementById("search-button");
  const currentWeather = document.getElementById("current-weather");
  const fiveDayForecast = document.getElementById("five-day-forecast");
  const cityList = document.getElementById("list-items");
  let city = "";
  let recentArray = [];

  localStorageForRecent()

  // MAIN EXECTION
  searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    updatePage()
});


function updatePage(){
    city = citySearchInput.value;

    let weatherData = openWeatherAPICalls(city).then((weatherData) => {
      updateUI(weatherData);
    });
    if(!recentArray.includes(city)) {
        recentArray.push(city);
        addRecentSearch()
    }
}
  

//check local storage for recent searches
function localStorageForRecent() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
        console.log(localStorage.key(i));
        if (localStorage.key(i).includes('recentSearch:')) {
            let key = localStorage.key(i);
            let value = localStorage.getItem(key);
            let recentCity = document.createElement('li');
            recentCity.textContent = value;

            // Adding the event listener to each recent city element
            recentCity.addEventListener('click', function() {
                citySearchInput.value = this.textContent;
                updatePage(); // This will trigger the weather update for the clicked city
            });

            document.getElementById('list-items').appendChild(recentCity);
            recentArray.push(value);
        }
    }
}



  //API FUNCTIONS
  function geocodeCity(city) {
    let geocodeCityURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    return fetch(geocodeCityURL)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          return { lat: data[0].lat, lon: data[0].lon };
        } else {
          console.error("City not found");
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
        // localStorage.setItem(`${city} weatherData`, JSON.stringify(weatherData));
        return weatherData;
      } else {
        console.log("Error: City not found");
        return null;
      }
    });
    // add data to local storage
    
  }
  // END OF API FUNCTIONS

  function updateCurrentWeather(data) {
    if (data) {
      let formattedDescription = capitalizeWords(data.current.weather[0].description);
      let formattedDate = new Date(data.current.dt * 1000).toLocaleDateString("en-US");
  
      // Update location and date if available
      document.getElementById("location-date").textContent = `${city} ${formattedDate} - ${formattedDescription}`;
      document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
  
      // Update temperature, wind, and humidity
      document.getElementById("temperature").textContent = `${data.current.temp}°F`;
      document.getElementById("wind").textContent = `${data.current.wind_speed} MPH`;
      document.getElementById("humidity").textContent = `${data.current.humidity} %`;
    } else {
      console.log("No data available to update current weather");
    }
  }
  
  function update5DayForecast(data) {
    let formattedDate = new Date(data.current.dt * 1000).toLocaleDateString("en-US");
  
    for (let i = 1; i <= 5; i++) {
      let forecastDiv = document.getElementById(`forecast-${i}`);
      if (forecastDiv) {
        document.getElementById(`t-${i}`).textContent = `${data.daily[i].temp.day}°F`;
        document.getElementById(`w-${i}`).textContent = `${data.daily[i].wind_speed} MPH`;
        document.getElementById(`h-${i}`).textContent = `${data.daily[i].humidity} %`;
      }
    }
  }
  

  function updateUI(data) {
    updateCurrentWeather(data);
    update5DayForecast(data);
  }

  function addRecentSearch() {
        let recentCity = document.createElement('li')
        recentCity.textContent = city;
        recentCity.addEventListener('click', function() {
            citySearchInput.value = this.textContent;
            updatePage(); // This will trigger the weather update for the clicked city
        });
        document.getElementById('list-items').insertBefore(recentCity, cityList.childNodes[0])  
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
});
