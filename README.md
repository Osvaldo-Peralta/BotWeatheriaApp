<h1>WeatheriaApp but in a Bot Telegram</h1>
Este bot de Telegram te permite obtener información actualizada sobre el clima de diferentes ciudades utilizando la API de OpenWeatherMap.

➡️ @Weatheria_bot on Telegram ⬅️

# Funcionalidades
 - Consulta del Clima Actual: Obtén información detallada sobre la temperatura, humedad, velocidad del viento y descripción del clima de cualquier ciudad.
 - Consulta del Pronóstico por Horas: Obtén el pronóstico del clima por horas para las próximas 24 horas.
 - Consulta del Pronóstico de 5 Días:Obtén el pronóstico del clima para los próximos 5 días.
 - Configuración de Unidad de Medida: Elige entre _Celsius y Fahrenheit_ para la temperatura. (**Default is Celsius °C**)
 - Configuracion de Idioma: Elige el idioma entre las siguitenes opciones. (**Default is Spanish**)
    - `ES : Español`
    -  `EN : English`
    -  `JA : 日本語`

## Comandos

| command | description |
| --- | ---
| `/start` | Inicia el bot y muestra un mensaje de bienvenida con instrucciones básicas. |
| `/help` | Inicia el bot y muestra un mensaje de bienvenida con instrucciones básicas. |
| `/w <Ciudad>` | Obtiene el clima actual de la ciudad especificada. |
| `/f <Ciudad>` | Obtiene el pronóstico del dia en intervalos de 3 horas. |
| `/5days <Ciudad>` | Obtiene el pronóstico de 5 días para la ciudad especificada. |
| `/currentunits` | Podras ver la unidad actual de medida de la temperatura (°C) o (°F) |
| `/setunits` | Podras elegir una unidad de medida de tu preferencia (°C) o (°F) |
| `/setlang` | Podras elegir un idioma de tu preferencia (ES, EN, JA) |
| `/currentlang` | Podras ver el idioma actual.

## Instalación
1. Clona el repositorio o descarga el codigo.
2. Instala las dependencias usando `npm install`.
3. Obtén tu token de API de OpenWeatherMap [aquí](https://openweathermap.org/api) y reemplázalo en el archivo `index.js`
4. Obtén tu token de bot de Telegram utilizando el BotFather y reemplázalo en el archivo `index.js`.
5. Ejecuta el bot usando `node index.js.`

#### Ejemplo de Uso
Command to get Weather Current
```
/w México
```
This command will return the current weather in Mexico.

```
The climate in Mexico is:
Description: clouds
Temperature: 27.6 °C
Humidity: 47%.
Wind speed: 3.6 m/s 
```

## Contribuciones
Las contribuciones son bienvenidas. Si deseas mejorar este proyecto, por favor sigue estos pasos:
1. Haz un fork del proyecto.
2. Crea una nueva rama (`git checkout -b feature/improvement`).
3. Realiza tus cambios y confirma (`git commit -am 'Añade una nueva característica'`).
4. Empuja a la rama (`git push origin feature/improvement`).
5. Crea un Pull Request.

### Autor
@Osvaldo-Peralta
