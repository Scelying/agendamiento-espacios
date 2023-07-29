document.addEventListener("DOMContentLoaded", function () {
  const daysContainer = document.getElementById("daysContainer");
  const monthYearHeader = document.getElementById("monthYear");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const eventCard = document.getElementById("eventCard");
  const eventList = document.getElementById("eventList");

  let currentDate = new Date();
  let events = {}; // Variable para almacenar los eventos

  // Event listener para cambiar de mes al hacer clic en los botones
  prevBtn.addEventListener("click", () => changeMonth(-1));
  nextBtn.addEventListener("click", () => changeMonth(1));

  // Función para cargar automáticamente los días y eventos desde el archivo JSON
  function loadDays() {
    daysContainer.innerHTML = "";

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Obtenemos el día de la semana del primer día del mes (0: domingo, 1: lunes, ..., 6: sábado)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Creamos espacios en blanco para completar la primera semana
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDayElement = document.createElement("div");
      emptyDayElement.classList.add("empty-day");
      daysContainer.appendChild(emptyDayElement);
    }

    fetch("http://localhost:3000/events")
      .then((response) => response.json())
      .then((data) => {
        events = data.reduce((acc, curr) => {
          const year = new Date(curr.date).getFullYear();
          const month = new Date(curr.date).getMonth() + 1; // Los meses en JavaScript son 0-indexados, por lo que sumamos 1
          const day = new Date(curr.date).getDate() + 1;
          const eventDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`; // Convertir la fecha a formato "yyyy-mm-dd"
          if (!acc[eventDate]) acc[eventDate] = [];
          acc[eventDate].push(curr.event);
          return acc;
        }, {});

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
          const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const dayElement = document.createElement("div");
          dayElement.classList.add("day");
          dayElement.textContent = i;

          if (day.toDateString() === new Date().toDateString()) {
            dayElement.classList.add("today");
          }

          const year = day.getFullYear();
          const month = day.getMonth() + 1; // Los meses en JavaScript son 0-indexados, por lo que sumamos 1
          const dayOfMonth = day.getDate();
          const dayDate = `${year}-${month.toString().padStart(2, "0")}-${dayOfMonth.toString().padStart(2, "0")}`; // Convertir la fecha a formato "yyyy-mm-dd"
          if (events[dayDate]) {
            dayElement.classList.add("event");
            dayElement.title = events[dayDate].join("\n");
          }

          dayElement.addEventListener("click", () => showEvents(dayDate));

          daysContainer.appendChild(dayElement);
        }

        monthYearHeader.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
      })
      .catch(error => {
        console.error('Error al cargar eventos:', error);
      });
  }

  // Función para cambiar de mes
  function changeMonth(step) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + step, 1);
    loadDays();
  }

  // Función para mostrar la tarjeta de eventos y listar los eventos del día seleccionado
  function showEvents(dayDate) {
    const dayEvents = events[dayDate] || [];
    if (dayEvents.length === 0) {
      eventList.innerHTML = "<p>No hay eventos para este día.</p>";
    } else {
      eventList.innerHTML = dayEvents.map(event => `<p>${event}</p>`).join("");
    }

    eventCard.style.display = "block";

    const addEventBtn = document.getElementById("addEventBtn");
    addEventBtn.addEventListener("click", () => addNewEvent(dayDate));
  }

  // Función para agregar un nuevo evento
  function addNewEvent(dayDate) {
    const eventName = prompt("Ingrese el nombre del evento:");
    if (!eventName) return; // Si el usuario no ingresa un nombre, no se agrega el evento

    const newEvent = { date: dayDate, event: eventName };
    fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        loadDays(); // Actualizamos el calendario para reflejar el nuevo evento
      })
      .catch((error) => {
        console.error("Error al agregar evento:", error);
      });
  }

  // Carga inicial del calendario
  loadDays();
});
