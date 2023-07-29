const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/events", (req, res) => {
  fs.readFile("events.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error al leer el archivo de eventos" });
    } else {
      const events = JSON.parse(data);
      res.json(events);
    }
  });
});

app.post("/events", (req, res) => {
  const { date, event } = req.body;
  if (!date || !event) {
    return res.status(400).json({ error: "Falta la fecha o el nombre del evento en la solicitud" });
  }

  fs.readFile("events.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error al leer el archivo de eventos" });
    } else {
      const events = JSON.parse(data);
      events.push({ date, event });
      fs.writeFile("events.json", JSON.stringify(events, null, 2), (err) => {
        if (err) {
          res.status(500).json({ error: "Error al escribir en el archivo de eventos" });
        } else {
          res.json({ message: "Evento agregado exitosamente" });
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
