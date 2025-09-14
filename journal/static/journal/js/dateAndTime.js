document.addEventListener("DOMContentLoaded", () => {
  const dateElement = document.getElementById("current-date");
  const timeElement = document.getElementById("current-time");

  function updateDateTime() {
    const now = new Date();

    dateElement.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    timeElement.textContent = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  updateDateTime();
  const msToNextSecond = 1000 - new Date().getMilliseconds();
  setTimeout(() => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }, msToNextSecond);
});
