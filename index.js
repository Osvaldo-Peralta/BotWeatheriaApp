require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
// Coloca aquí tu API token
const token = process.env.TOKEN;
const weatherAPI_Key = process.env.WEATHER_API_KEY;
const fs = require("fs");
const messages = JSON.parse(fs.readFileSync("messages.json", "utf-8"));
const bot = new TelegramBot(token, { polling: true });

// Variable para almacenar las preferencias de unidades de los usuarios
const userPreferences = {};

// Manejador para el comando /w seguido del nombre de la ciudad

bot.onText(/\/w (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];

  // Obtener las preferencias de usuario (idioma y unidades)
  const { lang } = userPreferences[chatId] || {};
  const { units } = userPreferences[chatId] || {};

  console.log(`comando /w iniciado, idioma = ${lang}, unidad = ${units} `);

  const defaultLang = lang || "es"; // Idioma predeterminado: Español
  const defaultUnits = units || "metric"; // Unidades predeterminadas: Celsius
  const temperatureUnit = defaultUnits === "metric" ? "°C" : "°F"; // Establecer la unidad de temperatura
  console.log(
    `comando /w, lenguaje definido = ${defaultLang}, unidad definida = ${defaultUnits}`
  );
  // Llamar a la API de OpenWeatherMap para obtener el clima
  axios
    .get(
      `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherAPI_Key}&units=${defaultUnits}&lang=${defaultLang}`
    )
    .then((response) => {
      const weatherData = response.data;
      const weatherDescription = weatherData.weather[0].description;
      const temperature = weatherData.main.temp;
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind.speed;
      const countryCode = weatherData.sys.country;

      const message = `${messages[defaultLang].description}: ${weatherDescription}\n${messages[defaultLang].temperature}: ${temperature}${temperatureUnit}\n${messages[defaultLang].humidity}: ${humidity}%\n${messages[defaultLang].wind_speed}: ${windSpeed} m/s`;

      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(chatId, `${messages[defaultLang].error_message}`);
    });
});

// Manejador para el comando /forecast

bot.onText(/\/f (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];

  // Obtener las preferencias de usuario (idioma y unidades)
  const { lang } = userPreferences[chatId] || {};
  const { units } = userPreferences[chatId] || {};

  console.log(`comando /w iniciado, idioma = ${lang}, unidad = ${units} `);

  const defaultLang = lang || "es"; // Idioma predeterminado: Español
  const defaultUnits = units || "metric"; // Unidades predeterminadas: Celsius

  const temperatureUnit = units === "metric" ? "°C" : "°F";

  // Llamar a la API de OpenWeatherMap para obtener el pronóstico por horas
  axios
    .get(
      `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherAPI_Key}&units=${defaultUnits}&lang=${defaultLang}`
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

        message += `${date}:\n${messages[defaultLang].description}: ${weatherDescription}\n${messages[defaultLang].temperature}: ${temperature}${temperatureUnit}\n${messages[defaultLang].humidity}: ${humidity}%\n${messages[defaultLang].wind_speed}: ${windSpeed} m/s\n\n`;
      });
      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(chatId, `${messages[defaultLang].error_message}`);
    });
});

// Manejador para el comando /5days seguido del nombre de la ciudad
bot.onText(/\/5days (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cityName = match[1];

  // Obtener las preferencias de usuario (idioma y unidades)
  const { lang } = userPreferences[chatId] || {};
  const { units } = userPreferences[chatId] || {};

  console.log(`comando /w iniciado, idioma = ${lang}, unidad = ${units} `);

  const defaultLang = lang; // Idioma predeterminado: Español
  const defaultUnits = units || "metric"; // Unidades predeterminadas: Celsius

  const temperatureUnit = units === "metric" ? "°C" : "°F"; // Establecer la unidad de temperatura

  // Llamar a la API de OpenWeatherMap para obtener el pronóstico de 5 días
  axios
    .get(
      `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherAPI_Key}&units=${defaultUnits}&lang=${defaultLang}`
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

// El comando de alertas no funciona debido a mi plan de suscripcion a la API
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
    "Hola! Soy tu bot de Clima en Telegram.\nEscribe el comando /help para ver todos los comandos disponibles\n"
  );
});

// Manejador para el comando /units seguido de las unidades (metric o imperial)
/* Cambio de leer texto a "escuchar si uno de los botones es seleccionado" */

// Manejador para el comando /setlang
bot.onText(/\/setlang/, (msg) => {
  const chatId = msg.chat.id;

  // Teclado para seleccionar el idioma
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Español", callback_data: "setlang_es" },
          { text: "English", callback_data: "setlang_en" },
          { text: "日本語", callback_data: "setlang_ja" },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, "Selecciona tu idioma preferido:", keyboard);
});

// Manejador para el comando /setunits
bot.onText(/\/setunits/, (msg) => {
  const chatId = msg.chat.id;

  // Teclado para seleccionar las unidades de temperatura
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Celsius", callback_data: "setunits_metric" },
          { text: "Fahrenheit", callback_data: "setunits_imperial" },
        ],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    "Selecciona tus unidades de temperatura preferidas:",
    keyboard
  );
});

// Manejador para callbacks de configuración de unidades
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const callbackData = query.data;

  // Manejar configuración de unidades de temperatura
  if (callbackData.startsWith("setunits_")) {
    const units = callbackData.replace("setunits_", "");

    console.log(`callback unidades, unidad seleccionada = ${units}`);

    // Actualizar la preferencia de unidades de temperatura del usuario
    userPreferences[chatId] = userPreferences[chatId] || {};
    userPreferences[chatId].units = units;

    console.log(`callback unidades, unidad almacenada = ${units}`);

    // Confirmar al usuario la actualización de las unidades
    let message = `Unidades de temperatura configuradas a `;
    if (units === "metric") {
      message += "Celsius";
      console.log(`callback units, comparacion = ${units}`);
    } else if (units === "imperial") {
      message += "Fahrenheit";
      console.log(`callback units, comparacion = ${units}`);
    }
    bot.sendMessage(chatId, message);

    // Editar el mensaje para eliminar el teclado
    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    );

    return;
  }

  if (callbackData.startsWith("setlang_")) {
    const lang = callbackData.replace("setlang_", "");

    console.log(`callback idioma, idioma seleccionado = ${lang}`);

    // Actualizar la preferencia de unidades de temperatura del usuario
    userPreferences[chatId] = userPreferences[chatId] || {};
    userPreferences[chatId].lang = lang;

    console.log(`callback idioma, idioma almacenado = ${lang}`);

    // Configurar al usuario la actualizacion del idioma

    let message = `Idioma configurado a `;
    if (lang === "es") {
      message += "Español";
    } else if (lang === "en") {
      message += "Ingles";
    } else if (lang === "ja") {
      message += "日本語";
    }
    bot.sendMessage(chatId, message);

    // Editar el mensaje para eliminar el teclado
    bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: messageId }
    );

    return;
  }
});

// Manejador para el comando /currentunits
bot.onText(/\/currentunits/, (msg) => {
  const chatId = msg.chat.id;

  // Obtener las preferencias de usuario (unidades)
  const { units } = userPreferences[chatId] || {};

  console.log(`Comando /currentunits = ${units}`);

  let message = "Tus unidades de temperatura actuales son: ";
  if (units) {
    if (units === "metric") {
      message += "Celsius °C";
    } else if (units === "imperial") {
      message += "Fahrenheit °F";
    }
  } else {
    message += " No has configurado tus unidades de temperatura aún.";
    console.log(`comando /currentunits, nada seleccionado = ${units}`);
  }

  bot.sendMessage(chatId, message);
});

bot.onText(/\/currentlang/, (msg) => {
  const chatId = msg.chat.id;
  // Obtener las preferencias de usuario (idioma)
  const { lang } = userPreferences[chatId] || {};
  const currentlang = lang || "es";

  let message = "Tus unidades de temperatura actuales son:";
  if (currentlang) {
    if (currentlang === "es") {
      message += " Español";
    } else if (currentlang === "en") {
      message += " English";
    } else if (currentlang === "ja") {
      message += " 日本語";
    }
  } else {
    message += " No has configurado tu idioma preferido aun";
  }

  bot.sendMessage(chatId, message);
});

// Manejador para el comando /help

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
    Comandos Disponibles:\n 
    /start - Inicia el bot.
    /w <Ciudad> - Obtener el clima de una ciudad.
    /f <Ciudad> - Obtener el pronostico del dia en intervalos de 3 horas.
    /5days <Ciudad> - Obtener el pronostico de los proximos 5 dias.
    /setunits - Cambiar las unidades de medida.
    /currentunits - Ver la unidad de medida actual.
    /setlang - Cambiar el idioma de respuesta.
    /currentlang - Ver el idioma actual.
    /help - Mostrar ayuda.
    `;
  bot.sendMessage(msg.chat.id, helpMessage);
});

// Comando /settings - Ejemplo de comando adicional
bot.onText(/\/settings/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Ajustes: Aquí puedes configurar tus preferencias."
  );
});
