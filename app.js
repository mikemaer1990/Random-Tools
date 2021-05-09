// Set up speech recognition - create shortcut to remove webkit
window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

// Create our speech recognition object
const recognition = new SpeechRecognition();
recognition.interimResults = true;

// Create our p element to push sentences into
let p = document.createElement("p");

// Select the words parent element
const words = document.querySelector(".words");
// Append p to the words div
words.appendChild(p);

function assistantTerms(query) {
    const googleRegex = new RegExp(/search google|google|search for/gi);
    const weatherRegex = new RegExp(
        /weather|whats the weather|temperature|forecast/gi
    );
    const timeRegex = new RegExp(/\s*?time\s*?|what time is it/);
    const quoteRegex = new RegExp(/\s*?quote\s*?/);
    const jokeRegex = new RegExp(/\s*?joke\s*?/);
    if (query.match(googleRegex)) {
        let extract = query.match(googleRegex);
        query = query.replace(extract, "").trim();
        window.open(`https://www.google.com/search?q=${query}`, "_blank");
    } else if (query.match(weatherRegex)) {
        getLocationThenWeather();
    } else if (query.match(timeRegex)) {
        getTime();
    } else if (query.match(quoteRegex)) {
        getQuoteOfDay();
    } else if (query.match(jokeRegex)) {
        getJokeOfDay();
    }
}

function handleSpeech(e) {
    // Create an array from the transcript object
    const transcript = Array.from(e.results)
        // Dig deeper in array
        .map((result) => result[0])
        // And deeper
        .map((result) => result.transcript)
        // Join the results together
        .join("");
    // Add the text to our p element
    p.textContent = transcript;

    // Only push the isFinal results into our word div
    if (e.results[0].isFinal) {
        // Check if any of the terms match our assistant's terms
        assistantTerms(transcript);
        p = document.createElement("p");
        words.appendChild(p);
    }
}

const getLocation = async () => {
    const request = await fetch("https://geolocation-db.com/json/");
    const data = await request.json();
    return data.IPv4;
};

const getWeather = async (location) => {
    const request = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=87fd74d91a204d6abd943807210605&q=${location}&days=2&aqi=yes&alerts=no`
    );
    const data = await request.json();
    return data;
};

const getLocationThenWeather = async () => {
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
    const weatherDiv = document.createElement("div");
    weatherDiv.innerHTML = weatherDivHtml;
    document.body.insertBefore(weatherDiv, words.nextSibling);
    p.innerHTML = `
        It is currently ${weatherObj.current.temp}&deg;C and ${weatherObj.current.condition} in ${weatherObj.location}. The high for today is ${weatherObj.forecast.today.high}&deg;C, and the low for today is ${weatherObj.forecast.today.low}&deg;C
    `;
};

function getTime() {
    const time = new Date();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    theTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    p.innerText = theTime;
}

const getJokeOfDay = async () => {
    const request = await fetch("https://api.jokes.one/jod");
    const data = await request.json();
    joke = data.contents.jokes[0].joke.text;
    words.innerText = joke
};

const getQuoteOfDay = async () => {
    const request = await fetch("https://quotes.rest/qod?language=en");
    const data = await request.json();
    const quote = {
        text: data.contents.quotes[0].quote,
        author: data.contents.quotes[0].author,
    };
    words.innerHTML = `
        <p>${quote.text}</p>
        <p class="quote-author">- ${quote.author}</p>
    `;
};

// Listen for results on the recognition object
recognition.addEventListener("result", handleSpeech);
// Whenever the recognition event ends - start it again
recognition.addEventListener("end", recognition.start);
// Initialize listening at the beginning of app
recognition.start();