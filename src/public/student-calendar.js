const calendarGrid = document.querySelector("[data-calendar-grid]");
const calendarTitle = document.querySelector("[data-calendar-title]");
const calendarDetail = document.querySelector("[data-calendar-detail]");
const prevButton = document.querySelector("[data-calendar-prev]");
const nextButton = document.querySelector("[data-calendar-next]");
const dataNode = document.querySelector("#calendar-lessons-data");

if (calendarGrid && calendarTitle && dataNode) {
  const lessons = JSON.parse(dataNode.textContent || "[]");
  const lessonsByDate = lessons.reduce((grouped, lesson) => {
    grouped[lesson.date] = grouped[lesson.date] || [];
    grouped[lesson.date].push(lesson);
    return grouped;
  }, {});

  const firstLessonDate = lessons[0]?.date ? new Date(`${lessons[0].date}T00:00:00`) : new Date();
  let visibleYear = firstLessonDate.getFullYear();
  let visibleMonth = firstLessonDate.getMonth();

  function formatClp(amount) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function dateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function renderDetail(key) {
    const dayLessons = lessonsByDate[key] || [];

    if (dayLessons.length === 0) {
      calendarDetail.textContent = "No hay clases registradas ese dia.";
      return;
    }

    const total = dayLessons.reduce((sum, lesson) => sum + lesson.amountCharged, 0);
    calendarDetail.innerHTML = `
      <strong>${dayLessons.length} clase(s) el ${key}</strong>
      <span>${dayLessons.map((lesson) => `${lesson.durationMinutes} min - ${formatClp(lesson.amountCharged)}`).join("<br>")}</span>
      <span>Total: ${formatClp(total)}</span>
    `;
  }

  function renderCalendar() {
    calendarGrid.innerHTML = "";

    const monthDate = new Date(visibleYear, visibleMonth, 1);
    const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    const startOffset = (monthDate.getDay() + 6) % 7;

    calendarTitle.textContent = new Intl.DateTimeFormat("es-CL", {
      month: "long",
      year: "numeric"
    }).format(monthDate);

    for (let index = 0; index < startOffset; index += 1) {
      const emptyCell = document.createElement("span");
      emptyCell.className = "calendar-day calendar-day-empty";
      calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = dateKey(visibleYear, visibleMonth, day);
      const dayLessons = lessonsByDate[key] || [];
      const button = document.createElement("button");

      button.type = "button";
      button.className = dayLessons.length > 0 ? "calendar-day has-lessons" : "calendar-day";
      button.innerHTML = `<span>${day}</span>${dayLessons.length > 0 ? `<small>${dayLessons.length}</small>` : ""}`;
      button.addEventListener("click", () => renderDetail(key));

      calendarGrid.appendChild(button);
    }
  }

  prevButton.addEventListener("click", () => {
    visibleMonth -= 1;
    if (visibleMonth < 0) {
      visibleMonth = 11;
      visibleYear -= 1;
    }
    renderCalendar();
  });

  nextButton.addEventListener("click", () => {
    visibleMonth += 1;
    if (visibleMonth > 11) {
      visibleMonth = 0;
      visibleYear += 1;
    }
    renderCalendar();
  });

  renderCalendar();
}
