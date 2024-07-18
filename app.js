let schemas = []

function loadContent(page, element) {
  fetch(`templates/${page}.html`)
    .then((response) => response.text())
    .then((dataContent) => {
      if (dataContent !== null) {
        document.getElementById('content').innerHTML = dataContent

        // Mise à jour des classes des éléments de navigation
        const navLinks = document.querySelectorAll('.nav-link')
        navLinks.forEach((link) => {
          link.classList.remove('active')
        })

        if (element) {
          element.classList.add('active')
        }

        const schemaJson = document.getElementById('schemaJson')
        const schemaJsonName = document.getElementById('schemaJsonName')
        const saveSchema = document.getElementById('saveSchema')
        const schemaDetails = document.getElementById('schemaDetails')
        const formContainer = document.getElementById('formContainer')
        const schemaList = document.getElementById('schemaList')

        // Vérifiez que schemaList existe
        /* if (!schemaList) {
          console.error("schemaList element not found");
          return;
        } */

        fetch('./data/data.json')
          .then((resp) => resp.json())
          .then((dataDB) => {
            console.log('Data loaded from JSON:', dataDB)
            schemas = dataDB
            console.log('Schemas after loading:', schemas)
            if (page === 'liste') {
              updateSchemaList()
            }

            updateSchemaCount()

            // Sauvegarder le schéma
            if (saveSchema) {
              saveSchema.addEventListener('click', () => {
                try {
                  const schema = JSON.parse(schemaJson.value)
                  const schemaName = schemaJsonName.value.trim()
                  if (schemaName) {
                    if (!schemas[schemaName]) schemas[schemaName] = []
                    if (!Array.isArray(schemas[schemaName]))
                      schemas[schemaName] = []
                    schemas[schemaName].push(schema)
                    if (page === 'liste') {
                      updateSchemaList()
                    }
                    updateSchemaCount()
                    schemaJson.value = ''
                    schemaJsonName.value = ''
                    alert('Schema saved successfully')
                  } else {
                    alert('Please enter a schema name')
                  }
                } catch (error) {
                  alert('Invalid JSON format')
                }
              })
            }

            // Mettre à jour la liste des schémas
            function updateSchemaList() {
              schemaList.innerHTML = ''
              Object.keys(schemas).forEach((key) => {
                if (Array.isArray(schemas[key])) {
                  schemas[key].forEach((_schema, index) => {
                    const listItem = document.createElement('div')
                    listItem.classList.add(
                      'list-group-item',
                      'list-group-item-action',
                    )
                    listItem.textContent = `Schema ${index + 1}: ${key}`
                    listItem.addEventListener('click', () =>
                      viewSchema(index, key),
                    )
                    schemaList.appendChild(listItem)
                  })
                } else {
                  console.error(`schemas[${key}] is not an array`)
                }
              })
            }

            // Mettre à jour le nombre de schémas
            function updateSchemaCount() {
              const schemaCount = Object.values(schemas).reduce(
                (acc, val) => acc + val.length,
                0,
              )
              const schemaCountElement = document.getElementById(
                'nombreSchemas',
              )

              if (page === 'home') {
                if (schemaCountElement) {
                  console.log('Updating schema count:', schemaCount)
                  schemaCountElement.textContent = schemaCount
                } else {
                  console.error('nombreSchemas element not found')
                }
              }
            }

            // Voir les détails du schéma
            function viewSchema(index, key) {
              const schema = schemas[key][index]
              schemaDetails.textContent = JSON.stringify(schema, null, 2)
              const generateFormButton = document.getElementById('generateForm')
              const deleteSchemaButton = document.getElementById('deleteSchema')
              const nameSchemaDetails = document.getElementById(
                'nameSchemaDetails',
              )

              generateFormButton.onclick = () => generateForm(schema)
              deleteSchemaButton.onclick = () => deleteSchema(index, key)
              nameSchemaDetails.innerText = key

              const schemaDetailsModal = new bootstrap.Modal(
                document.getElementById('schemaDetailsModal'),
              )
              schemaDetailsModal.show()
            }

            // Générer le formulaire
            function generateForm(schema) {
              formContainer.innerHTML = ''
              const form = document.createElement('form')
              form.classList.add('needs-validation')
              form.setAttribute('novalidate', '')

              // Fonction pour créer des groupes de formulaires pour différents types d'entrée
              function createFormGroup(
                labelText,
                inputValue,
                inputType = 'text',
              ) {
                const formGroup = document.createElement('div')
                formGroup.classList.add('mb-3')
                const label = document.createElement('label')
                label.classList.add('form-label')
                label.textContent = labelText
                formGroup.appendChild(label)
                const input = document.createElement('input')
                input.classList.add('form-control')
                input.setAttribute('type', inputType)
                input.setAttribute(
                  'value',
                  inputValue !== null ? inputValue : '',
                )
                formGroup.appendChild(input)
                return formGroup
              }

              // Fonction récursive pour gérer les objets imbriqués
              function processObject(obj, parentKey = '') {
                Object.keys(obj).forEach((key) => {
                  const fullKey = parentKey ? `${parentKey}.${key}` : key
                  if (
                    typeof obj[key] === 'object' &&
                    !Array.isArray(obj[key])
                  ) {
                    processObject(obj[key], fullKey)
                  } else {
                    form.appendChild(createFormGroup(fullKey, obj[key]))
                  }
                })
              }

              processObject(schema)

              function formatHTML(html) {
                const tab = '  '
                let result = ''
                let indent = ''
                html.split(/>\s*</).forEach((element) => {
                  if (element.match(/^\/\w/)) {
                    indent = indent.substring(tab.length)
                  }
                  result += indent + '<' + element + '>\n'
                  if (
                    element.match(/^<?\w[^>]*[^/]$/) &&
                    !element.startsWith('input')
                  ) {
                    indent += tab
                  }
                })
                return result.substring(1, result.length - 2)
              }

              formContainer.textContent = formatHTML(form.outerHTML)
            }

            // Supprimer le schéma
            function deleteSchema(index, key) {
              schemas[key].splice(index, 1)
              if (schemas[key].length === 0) {
                delete schemas[key]
              }
              if (page === 'liste') {
                updateSchemaList()
              }
              updateSchemaCount()
              alert('Schema deleted successfully')
            }
          })
          .catch((error) => {
            console.error('Error fetching data:', error)
          })
      }
    })
    .catch((error) => {
      console.error('Error loading template:', error)
    })
}

window.onload = function () {
  loadTemplate('header', 'header')
  loadTemplate('footer', 'footer')
  loadContent('home', document.querySelector('.nav-link'))
}
