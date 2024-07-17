function loadContent(page, element) {
  fetch(`templates/${page}.html`)
    .then((response) => response.text())
    .then((dataContent) => {
      if (dataContent !== null) {
        document.getElementById("content").innerHTML = dataContent;

        // mise à jour de classes des éléments de navigation
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });

        if (element) {
          element.classList.add("active");
        }

        const schemaList = document.getElementById("schemaList");
        const schemaJson = document.getElementById("schemaJson");
        const schemaDetails = document.getElementById("schemaDetails");
        const formContainer = document.getElementById("formContainer");

        let schemas = [];

        // Save schema event listener
        document.getElementById("saveSchema").addEventListener("click", () => {
          try {
            const schema = JSON.parse(schemaJson.value);
            if (!schemas["2024"]) schemas["2024"] = [];
            schemas["2024"].push(schema);
            updateSchemaList();
            schemaJson.value = "";
            alert("Schema saved successfully");
          } catch (error) {
            alert("Invalid JSON format");
          }
        });

        // Update schema list
        function updateSchemaList() {
          schemaList.innerHTML = "";
          (schemas["2024"] || []).forEach((schema, index) => {
            const listItem = document.createElement("div");
            listItem.classList.add("list-group-item", "list-group-item-action");
            listItem.textContent = schema.indicateur || `Schema ${index + 1}`;
            listItem.addEventListener("click", () => viewSchema(index));
            schemaList.appendChild(listItem);
          });
        }

        // View schema details
        function viewSchema(index) {
          const schema = schemas["2024"][index];
          schemaDetails.textContent = JSON.stringify(schema, null, 2);
          const generateFormButton = document.getElementById("generateForm");
          const deleteSchemaButton = document.getElementById("deleteSchema");

          generateFormButton.onclick = () => generateForm(schema);
          deleteSchemaButton.onclick = () => deleteSchema(index);

          const schemaDetailsModal = new bootstrap.Modal(
            document.getElementById("schemaDetailsModal")
          );
          schemaDetailsModal.show();
        }

        // Generate form
        function generateForm(schema) {
          formContainer.innerHTML = "";
          const form = document.createElement("form");
          form.classList.add("needs-validation");
          form.setAttribute("novalidate", "");

          // Function to create form groups for different input types
          function createFormGroup(labelText, inputValue, inputType = "text") {
            const formGroup = document.createElement("div");
            formGroup.classList.add("mb-3");

            const label = document.createElement("label");
            label.classList.add("form-label");
            label.textContent = labelText;
            formGroup.appendChild(label);

            const input = document.createElement("input");
            input.classList.add("form-control");
            input.setAttribute("type", inputType);
            input.setAttribute("value", inputValue !== null ? inputValue : "");
            formGroup.appendChild(input);

            return formGroup;
          }

          // Recursive function to handle nested objects
          function processObject(obj, parentKey = "") {
            Object.keys(obj).forEach((key) => {
              const fullKey = parentKey ? `${parentKey}.${key}` : key;
              if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
                processObject(obj[key], fullKey);
              } else {
                form.appendChild(createFormGroup(fullKey, obj[key]));
              }
            });
          }

          processObject(schema);
          formContainer.appendChild(form);
        }

        // Delete schema
        function deleteSchema(index) {
          schemas["2024"].splice(index, 1);
          updateSchemaList();
          alert("Schema deleted successfully");
        }
      }
    })
    .catch((error) => console.error("Error loading template:", error));
}

window.onload = function () {
  loadTemplate("header", "header");
  loadTemplate("footer", "footer");
  loadContent("home", document.querySelector(".nav-link"));
};
