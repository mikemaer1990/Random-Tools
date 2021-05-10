// Select our DOM elements
const buttons = [...document.querySelectorAll(".button-container button")];
const buttonContainer = document.querySelector(".button-container");
const body = document.querySelector(".wrapper");
const content = document.querySelector(".content");

// Global to keep track of if buttons are at the top
let atTop = false;
// Global displayContent variable to check if content is currently being shown
let displayContent, timeInterval;

// Eventlisteners for the buttons
buttons.forEach((button) => button.addEventListener("click", handleClicks));

// Function to handle button clicks
function handleClicks() {
    // Get amount of pixels to top of page
    // To be used to move the button groups to the top
    const toTop = this.getBoundingClientRect().top - 10;
    // Get the data-info value from the button
    const whatToDo = this.dataset.info;
    // If the button group is at the top when clicked - move them to the middle of page
    if (atTop) {
        buttonContainer.style.transform = `translateY(${toTop}px)`;
        // If they are in the middle of page - then move to top
    } else {
        buttonContainer.style.transform = `translateY(-${toTop}px)`;
    }
    // Decide what funcitons to run based on the data-info values
    switch (whatToDo) {
        case "time":
            getTime();
            break;
        case "weather":
            getLocationThenWeather();
            break;
        case "joke":
            getJokeOfDay();
            break;
        case "quote":
            getQuoteOfDay();
            break;
        case "fact":
            getRandomFact();
            break;
    }
    // Alternate the at top boolean
    atTop = !atTop;
}

// Function to remove displayed content if exists
function removeContent() {
    displayContent.classList.remove("active");
    setTimeout(() => {
        displayContent.remove();
        displayContent = "";
    }, 100);
}

const getLocation = async () => {
    const request = await fetch("https://geolocation-db.com/json/");
    const data = await request.json();
    return data.IPv4;
};

const getWeather = async (location) => {
    const request = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=87fd74d91a204d6abd943807210605&q=${location}&days=2&aqi=yes&alerts=no`
    );
    const data = await request.json();
    return data;
};

const getLocationThenWeather = async () => {
    if (displayContent) {
        removeContent();
        return;
    }
    const location = await getLocation();
    const weather = await getWeather(location);
    const weatherObj = {
        location: weather.location.name,
        current: {
            temp: Math.round(weather.current.temp_c),
            condition: weather.current.condition.text,
            img: weather.current.condition.icon,
            air: Math.round(weather.current.air_quality.pm10),
        },
        forecast: {
            today: {
                date: weather.forecast.forecastday[0].date,
                high: Math.round(weather.forecast.forecastday[0].day.maxtemp_c),
                low: Math.round(weather.forecast.forecastday[0].day.mintemp_c),
                condition: weather.forecast.forecastday[0].day.condition.text,
                img: weather.forecast.forecastday[0].day.condition.icon,
                precipitation: weather.forecast.forecastday[0].day.daily_chance_of_rain ||
                    weather.forecast.forecastday[0].day.daily_chance_of_snow,
            },
            tomorrow: {
                date: weather.forecast.forecastday[1].date,
                high: Math.round(weather.forecast.forecastday[1].day.maxtemp_c),
                low: Math.round(weather.forecast.forecastday[1].day.mintemp_c),
                condition: weather.forecast.forecastday[1].day.condition.text,
                img: weather.forecast.forecastday[1].day.condition.icon,
                precipitation: weather.forecast.forecastday[1].day.daily_chance_of_rain ||
                    weather.forecast.forecastday[1].day.daily_chance_of_snow,
            },
        },
    };

    const weatherDivHtml = `
        <h1 class="weather-title">${weatherObj.location}</h1>
        <div class="weather-wrapper">
            <div class="weather">
                <h4>Current</h4>
                <p class="current-temp">${weatherObj.current.temp}&deg;C</p>
                <div class="condition-div">
                    <figure>
                        <img class="condition" src="https://${weatherObj.current.img}">
                    </figure>
                    <p class="condition-text">${weatherObj.current.condition}</p>
                </div>
                <div class="precipitation air">
                <img class="precipitation-img" src="./mask.png" width="30px" height="30px">
                    <p class="air-text">PM<sub>10</sub> | <span class="air-rating">${weatherObj.current.air}</span></p>
                    </div>
            </div>
            <div class="weather">
                <h4>Today</h4>
                <p class="current-temp">${weatherObj.forecast.today.high}&deg;C | ${weatherObj.forecast.today.low}&deg;C</p>
                <div class="condition-div">
                    <figure>
                        <img class="condition" src="https://${weatherObj.forecast.today.img}">
                    </figure>
                    <p class="condition-text">${weatherObj.forecast.today.condition}</p>
                </div>
                <div class="precipitation">
                    <img class="precipitation-img" src="./rain.png" width="30px" height="30px">
                    <p class="precipitation-text"> | ${weatherObj.forecast.today.precipitation}%</p>
                </div>
            </div>
            <div class="weather">
                <h4>Tomorrow</h4>
                <p class="current-temp">${weatherObj.forecast.tomorrow.high}&deg;C | ${weatherObj.forecast.tomorrow.low}&deg;C</p>
                <div class="condition-div">
                    <figure>
                        <img class="condition" src="https://${weatherObj.forecast.tomorrow.img}">
                    </figure>
                    <p class="condition-text">${weatherObj.forecast.tomorrow.condition}</p>
                </div>
                <div class="precipitation">
                    <img class="precipitation-img" src="./rain.png" width="30px" height="30px">
                    <p class="precipitation-text"> | ${weatherObj.forecast.tomorrow.precipitation}%</p>
                </div>
            </div>
        </div>
    `;
    displayContent = document.createElement("div");
    displayContent.innerHTML = weatherDivHtml;
    setTimeout(() => {
        content.append(displayContent);
    }, 200);
};

function setTime() {
    const time = new Date();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    theTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    displayContent.innerText = `${theTime}`;
    displayContent.classList.add("clock", "display-content");
    setTimeout(() => {
        content.append(displayContent);
    }, 200);
    displayContent.classList.add("active");
}

function getTime() {
    if (displayContent) {
        removeContent();
        clearInterval(timeInterval)
        return;
    }
    displayContent = document.createElement("div");
    timeInterval = setInterval(setTime, 100)
}

const getJokeOfDay = async () => {
    if (displayContent) {
        removeContent();
        return;
    }
    const request = await fetch("https://api.jokes.one/jod");
    const data = await request.json();
    joke = data.contents.jokes[0].joke.text;
    displayContent = document.createElement("div");
    displayContent.classList.add("text", "display-content");
    displayContent.innerHTML = joke;
    setTimeout(() => {
        content.append(displayContent);
    }, 200);
};

const getQuoteOfDay = async () => {
    if (displayContent) {
        removeContent();
        return;
    }
    const request = await fetch("https://quotes.rest/qod?language=en");
    const data = await request.json();
    const quote = {
        text: data.contents.quotes[0].quote,
        author: data.contents.quotes[0].author,
    };
    displayContent = document.createElement("div");
    displayContent.classList.add("text", "display-content");
    displayContent.innerHTML = `
        <p>${quote.text}</p>
        <p class="quote-author">- ${quote.author}</p>
    `;
    setTimeout(() => {
        content.append(displayContent);
    }, 200);
};

const getRandomFact = async () => {
    if (displayContent) {
        removeContent();
        return;
    }
    const request = await fetch(
        "https://uselessfacts.jsph.pl/random.json?language=en"
    );
    const data = await request.json();
    const fact = data.text;
    displayContent = document.createElement("div");
    displayContent.classList.add("text", "display-content");
    displayContent.innerHTML = fact;
    setTimeout(() => {
        content.append(displayContent);
    }, 200);
};