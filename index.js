require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
// Coloca aquí tu API token
const token = process.env.TOKEN;
const weatherAPI_Key = process.env.WEATHER_API_KEY;
const bot = new TelegramBot(token, { polling: true });

// Variable para almacenar las preferencias de unidades de los usuarios
const userPreferences = {};

// Manejador para el comando /w seguido del nombre de la ciudad

bot.onText(/\/w (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];
  const units = userPreferences[chatId] || "metric"; // Usar la preferencia del usuario o métrico por defecto
  const temperatureUnit = units === "metric" ? "°C" : "°F"; // Establecer la unidad de temperatura

  // Llamar a la API de OpenWeatherMap para obtener el clima
  axios
    .get(
      `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherAPI_Key}&units=${units}&lang=es`
    )
    .then((response) => {
      const weatherData = response.data;
      const weatherDescription = weatherData.weather[0].description;
      const temperature = weatherData.main.temp;
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind.speed;

      const message = `
          El clima en ${cityName} es:\nDescripción: ${weatherDescription}\nTemperatura: ${temperature}${temperatureUnit}\nHumedad: ${humidity}%\nVelocidad del viento: ${windSpeed} m/s\n
        `;

      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(
        chatId,
        "No pude obtener el clima. Asegúrate de que el nombre de la ciudad es correcto."
      );
    });
});

// Manejador para el comando /forecast

bot.onText(/\/f (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];
  const units = userPreferences[chatId] || "metric";
  const temperatureUnit = units === "metric" ? "°C" : "°F";

  // Llamar a la API de OpenWeatherMap para obtener el pronóstico por horas
  axios
    .get(
      `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherAPI_Key}&units=${units}&lang=es`
    )
    .then((response) => {
      const forecastData = response.data.list.slice(0, 8);
      // Obtener las proximas 8 lecturas (24 horas en lapsos de 3 horas)
      let message = `Pronostico del clima en ${cityName} para las proximas 24 horas:\n\n`;

      forecastData.forEach((entry) => {
        const date = new Date(entry.dt * 1000);
        const weatherDescription = entry.weather[0].description;
        const temperature = entry.main.temp;
        const humidity = entry.main.humidity;
        const windSpeed = entry.wind.speed;

        message += `${date}:\nDescripcion: ${weatherDescription}\nTemperatura: ${temperature} ${temperatureUnit}\nHumedad: ${humidity}%\nVelocidad del viento: ${windSpeed}m/s\n\n`;
      });
      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(
        chatId,
        "No pude obtener el pronostico.\n Asegurate que el nombre de la ciudad es correcto"
      );
    });
});

// Manejador para el comando /5days seguido del nombre de la ciudad
bot.onText(/\/5days (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];
  const units = userPreferences[chatId] || "metric"; // Usar la preferencia del usuario o métrico por defecto
  const temperatureUnit = units === "metric" ? "°C" : "°F"; // Establecer la unidad de temperatura

  // Llamar a la API de OpenWeatherMap para obtener el pronóstico de 5 días
  axios
    .get(
      `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherAPI_Key}&units=${units}&lang=es`
    )
    .then((response) => {
      const forecastData = response.data.list;
      let message = `Pronóstico del clima en ${cityName} para los próximos 5 días:\n`;

      // Agrupar por día
      const days = {};
      forecastData.forEach((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        if (!days[date]) {
          days[date] = [];
        }
        days[date].push(entry);
      });

      // Crear mensaje para cada día
      for (const [date, entries] of Object.entries(days)) {
        message += `\n${date}:\n`;
        entries.forEach((entry) => {
          const time = new Date(entry.dt * 1000).toLocaleTimeString();
          const weatherDescription = entry.weather[0].description;
          const temperature = entry.main.temp;
          message += `${time} - ${weatherDescription}, ${temperature}${temperatureUnit}\n`;
        });
      }

      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(
        chatId,
        "No pude obtener el pronóstico. Asegúrate de que el nombre de la ciudad es correcto."
      );
    });
});

bot.onText(/\/alert (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];

  try {
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${weatherAPI_Key}`
    );

    const { lat, lon } = geoResponse.data[0];

    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${weatherAPI_Key}&units=metric&lang=es`
    );

    const alerts = weatherResponse.data.alerts || [];

    let message = `Alertas de clima severo para ${cityName}:\n`;

    if (alerts.length > 0) {
      alerts.forEach((alert) => {
        message += `\n${alert.event} - ${alert.description}\n`;
      });
    } else {
      message += `\nNo hay alertas de clima severo en este momento.\n`;
    }

    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(error);
    bot.sendMessage(
      chatId,
      "No pude obtener las alertas meteorológicas. Asegúrate de que el nombre de la ciudad es correcto."
    );
  }
});

/* Comandos de Utilidades */

// Para el comando /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Hola! Soy tu bot de Clima en Telegram. Enviame el nombre de una ciudad para obtener el clima actual.\nPrueba el comando /help para mas información.\nPuedes ver el clima de una ciudad con el comando /w <Ciudad>\n/f <Ciudad> - Para obtener el pronóstico por horas de una ciudad"
  );
});

// Manejador para el comando /units seguido de las unidades (metric o imperial)
/* Cambio de leer texto a "escuchar si uno de los botones es seleccionado" */
bot.onText(/\/units/, (msg) => {
  const chatId = msg.chat.id;

  // Enviar botones para seleccionar unidades
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Celsius (°C)", callback_data: "units_metric" },
          { text: "Fahrenheit (°F)", callback_data: "units_imperial" },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, "Selecciona la unidad de medida:", opts);
});
// query callback para manejar las unidades
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data === "units_metric" || data === "units_imperial") {
    const units = data === "units_metric" ? "metric" : "imperial"; // recibimos la unidad de medida

    // Guardar la preferencia del usuario
    userPreferences[chatId] = units;
    const unitText = units === "metric" ? "Celsius (°C)" : "Farenheit (°F)";
    bot.sendMessage(
      chatId,
      `Preferencia de unidades actualizada a ${unitText}.`
    );

    // Editar el mensaje original para quitar el teclado

    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: msg.message_id }
    );
  } else {
    bot.sendMessage(chatId, "Unidades no válidas. Usa 'metric' o 'imperial'.");
  }
});

// Manejador para el comando /currentunits
bot.onText(/\/currentunits/, (msg) => {
  const chatId = msg.chat.id;
  const units = userPreferences[chatId] || "metric";
  bot.sendMessage(
    chatId,
    `La unidad de medida actual es: ${
      units === "metric" ? "Métrico (°C)" : "Imperial (°F)"
    }.`
  );
});

// Manejador para el comando /help

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
    Comandos Disponibles: 
    /start - Inicia el bot.
    /w <Ciudad> - Obtener el clima de una ciudad.
    /f <Ciudad> - Obtener el pronostico del dia en intervalos de 3 horas.
    /5days <Ciudad> - Obtener el pronostico de los proximos 5 dias.
    /units - Cambiar las unidades de medida.
    /currentunits - Ver la unidad de medida actual.
    /help - Mostrar ayuda.
    `;
  bot.sendMessage(msg.chat.id, helpMessage);
});
