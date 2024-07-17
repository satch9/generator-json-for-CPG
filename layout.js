function loadTemplate(url, elementId) {
  fetch(`templates/${url}.html`)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
    })
    .catch((error) => console.error("Error loading template:", error));
}
