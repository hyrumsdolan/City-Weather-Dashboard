apiKey = ''
const citySearchInput = document.querySelector('#city-search');
const searchButton = document.getElementById('search-button');

// MAIN EXECTION
searchButton.addEventListener('click', function (event) {
    event.preventDefault();
    let city = citySearchInput.value;
    console.log("city:", city);
    update5DayForecast(openWeatherAPICalls(city))
    
});

//API FUNCTIONS
function geocodeCity(city) {
    let geocodeCityURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    return fetch(geocodeCityURL)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            } else {
                console.error('City not found');
                return null;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}


function getWeather(lat, lon) {
    let apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    fetch(apiURL)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        return data
    })
    .catch(function (error) {
        console.error('Error:', error);
    });
}

function openWeatherAPICalls(city) {
    geocodeCity(city).then(function(coords) {
        if (coords) {
            let weatherData = getWeather(coords.lat, coords.lon);
            return weatherData;
        }
        else {
            console.log('Error: City not found');
            return null;
        }
    });    
}
// END OF API FUNCTIONS