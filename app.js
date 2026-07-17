// =========================================================
// BIMP-EAGA BORDER IMAGERY VIEWER
// =========================================================


// =========================
// MAP CONFIGURATION
// =========================

const MAP_CONFIG = {

  initialCenter: [
    4.65,
    114.85
  ],

  initialZoom: 9,

  minZoom: 3,

  maxZoom: 19,

  projectBounds: [
    [
      4.05,
      113.95
    ],
    [
      5.15,
      115.55
    ]
  ]

};


// =========================
// APPLICATION STATE
// =========================

let currentBasemapIndex = 0;

let activeBasemap = null;

let activeImageryLayer = null;

let activeImageryId = null;

let pendingGeoTiffFile = null;

let toastTimeout = null;

const imageryDatasets = [];


// =========================
// BASEMAP DEFINITIONS
// =========================

const basemaps = [

  {
    id: "satellite",

    name: "Satellite",

    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/" +
      "World_Imagery/MapServer/tile/{z}/{y}/{x}",

    options: {
      attribution:
        "Tiles &copy; Esri",

      maxZoom:
        19
    }
  },

  {
    id: "dark",

    name: "Dark",

    url:
      "https://{s}.basemaps.cartocdn.com/" +
      "dark_all/{z}/{x}/{y}{r}.png",

    options: {
      attribution:
        "&copy; OpenStreetMap contributors &copy; CARTO",

      subdomains:
        "abcd",

      maxZoom:
        20
    }
  },

  {
    id: "street",

    name: "Street",

    url:
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    options: {
      attribution:
        "&copy; OpenStreetMap contributors",

      maxZoom:
        19
    }
  }

];


// =========================
// DOM ELEMENTS
// =========================

const resetViewButton =
  document.getElementById(
    "resetViewButton"
  );

const toggleBasemapButton =
  document.getElementById(
    "toggleBasemapButton"
  );

const zoomToImageryButton =
  document.getElementById(
    "zoomToImageryButton"
  );

const collapseSidebarButton =
  document.getElementById(
    "collapseSidebarButton"
  );

const expandSidebarButton =
  document.getElementById(
    "expandSidebarButton"
  );

const imagerySidebar =
  document.getElementById(
    "imagerySidebar"
  );

const mapCoordinates =
  document.getElementById(
    "mapCoordinates"
  );

const mapZoomLevel =
  document.getElementById(
    "mapZoomLevel"
  );

const geotiffInput =
  document.getElementById(
    "geotiffInput"
  );

const imagerySearchInput =
  document.getElementById(
    "imagerySearchInput"
  );

const imageryList =
  document.getElementById(
    "imageryList"
  );

const datasetCount =
  document.getElementById(
    "datasetCount"
  );

const selectedCount =
  document.getElementById(
    "selectedCount"
  );

const imageryDetailsPanel =
  document.getElementById(
    "imageryDetailsPanel"
  );

const closeDetailsButton =
  document.getElementById(
    "closeDetailsButton"
  );

const detailsTitle =
  document.getElementById(
    "detailsTitle"
  );

const detailsDate =
  document.getElementById(
    "detailsDate"
  );

const detailsFilename =
  document.getElementById(
    "detailsFilename"
  );

const detailsFileSize =
  document.getElementById(
    "detailsFileSize"
  );

const detailsCrs =
  document.getElementById(
    "detailsCrs"
  );

const importDialog =
  document.getElementById(
    "importDialog"
  );

const importForm =
  document.getElementById(
    "importForm"
  );

const closeImportDialogButton =
  document.getElementById(
    "closeImportDialogButton"
  );

const cancelImportButton =
  document.getElementById(
    "cancelImportButton"
  );

const imageryNameInput =
  document.getElementById(
    "imageryNameInput"
  );

const captureDateInput =
  document.getElementById(
    "captureDateInput"
  );

const imagerySourceInput =
  document.getElementById(
    "imagerySourceInput"
  );

const selectedFileName =
  document.getElementById(
    "selectedFileName"
  );

const comparisonToggle =
  document.getElementById(
    "comparisonToggle"
  );

const comparisonSlider =
  document.getElementById(
    "comparisonSlider"
  );

const comparisonSliderValue =
  document.getElementById(
    "comparisonSliderValue"
  );

const opacitySlider =
  document.getElementById(
    "opacitySlider"
  );

const opacitySliderValue =
  document.getElementById(
    "opacitySliderValue"
  );

const comparisonDivider =
  document.getElementById(
    "comparisonDivider"
  );

const beforeImagerySelect =
  document.getElementById(
    "beforeImagerySelect"
  );

const afterImagerySelect =
  document.getElementById(
    "afterImagerySelect"
  );

const swapComparisonButton =
  document.getElementById(
    "swapComparisonButton"
  );

const toast =
  document.getElementById(
    "toast"
  );

const toastMessage =
  document.getElementById(
    "toastMessage"
  );


// =========================
// INITIALIZE MAP
// =========================

const map =
  L.map(
    "map",
    {
      center:
        MAP_CONFIG.initialCenter,

      zoom:
        MAP_CONFIG.initialZoom,

      minZoom:
        MAP_CONFIG.minZoom,

      maxZoom:
        MAP_CONFIG.maxZoom,

      zoomControl:
        true,

      attributionControl:
        true,

      preferCanvas:
        true
    }
  );


L.control
  .scale(
    {
      position:
        "bottomleft",

      metric:
        true,

      imperial:
        false
    }
  )
  .addTo(
    map
  );


// =========================
// BASEMAP MANAGEMENT
// =========================

function loadBasemap(index) {

  const basemapConfig =
    basemaps[index];

  if (
    activeBasemap
  ) {

    map.removeLayer(
      activeBasemap
    );

  }

  activeBasemap =
    L.tileLayer(
      basemapConfig.url,
      basemapConfig.options
    );

  activeBasemap.addTo(
    map
  );

  activeBasemap.bringToBack();

  toggleBasemapButton.textContent =
    `Basemap: ${basemapConfig.name}`;

}


function switchBasemap() {

  currentBasemapIndex =
    (
      currentBasemapIndex +
      1
    ) %
    basemaps.length;

  loadBasemap(
    currentBasemapIndex
  );

  showToast(
    `${basemaps[currentBasemapIndex].name} basemap activated.`
  );

}


// =========================
// MAP VIEW
// =========================

function resetMapView() {

  map.fitBounds(
    MAP_CONFIG.projectBounds,
    {
      padding: [
        30,
        30
      ],

      animate:
        true,

      duration:
        0.8
    }
  );

}


function zoomToActiveImagery() {

  const dataset =
    getActiveDataset();

  if (
    !dataset
  ) {

    showToast(
      "Select an imagery dataset first."
    );

    return;

  }

  map.fitBounds(
    dataset.layer.getBounds(),
    {
      padding: [
        30,
        30
      ],

      animate:
        true
    }
  );

}


// =========================
// MAP INFORMATION
// =========================

function updateZoomLevel() {

  mapZoomLevel.textContent =
    `Zoom: ${map.getZoom()}`;

}


function updateMapCoordinates(event) {

  const latitude =
    event.latlng.lat.toFixed(
      5
    );

  const longitude =
    event.latlng.lng.toFixed(
      5
    );

  mapCoordinates.innerHTML =
    `Lat: ${latitude}` +
    ` &nbsp; Lon: ${longitude}`;

}


function clearMapCoordinates() {

  mapCoordinates.innerHTML =
    "Lat: — &nbsp; Lon: —";

}


// =========================
// SIDEBAR
// =========================

function collapseSidebar() {

  imagerySidebar.classList.add(
    "collapsed"
  );

  expandSidebarButton.hidden =
    false;

  setTimeout(
    function () {

      map.invalidateSize();

    },
    260
  );

}


function expandSidebar() {

  imagerySidebar.classList.remove(
    "collapsed"
  );

  expandSidebarButton.hidden =
    true;

  setTimeout(
    function () {

      map.invalidateSize();

    },
    260
  );

}


// =========================
// GEOTIFF FILE SELECTION
// =========================

function handleGeoTiffSelection(event) {

  const files =
    Array.from(
      event.target.files
    );

  if (
    files.length === 0
  ) {
    return;
  }

  pendingGeoTiffFile =
    files[0];

  selectedFileName.textContent =
    pendingGeoTiffFile.name;

  imageryNameInput.value =
    removeFileExtension(
      pendingGeoTiffFile.name
    );

  captureDateInput.value =
    "";

  imagerySourceInput.value =
    "";

  importDialog.showModal();

}


// =========================
// IMPORT GEOTIFF
// =========================

async function importGeoTiff(event) {

  event.preventDefault();

  if (
    !pendingGeoTiffFile
  ) {

    showToast(
      "No GeoTIFF file selected."
    );

    return;

  }

  const imageryName =
    imageryNameInput.value.trim();

  const captureDate =
    captureDateInput.value;

  const source =
    imagerySourceInput.value.trim() ||
    "Unknown source";

  if (
    !imageryName ||
    !captureDate
  ) {

    showToast(
      "Enter an imagery name and capture date."
    );

    return;

  }

  showToast(
    "Processing GeoTIFF imagery..."
  );

  const submitButton =
    importForm.querySelector(
      'button[type="submit"]'
    );

  submitButton.disabled =
    true;

  submitButton.textContent =
    "Processing...";

  try {

    const arrayBuffer =
      await pendingGeoTiffFile.arrayBuffer();

    const georaster =
      await parseGeoraster(
        arrayBuffer
      );

    const rasterLayer =
      new GeoRasterLayer(
        {
          georaster:
            georaster,

          opacity:
            1,

          resolution:
            256
        }
      );

    const dataset = {

      id:
        createDatasetId(),

      name:
        imageryName,

      date:
        captureDate,

      source:
        source,

      filename:
        pendingGeoTiffFile.name,

      fileSize:
        pendingGeoTiffFile.size,

      format:
        "GeoTIFF",

      width:
        georaster.width,

      height:
        georaster.height,

      projection:
        getProjectionLabel(
          georaster.projection
        ),

      layer:
        rasterLayer

    };

    imageryDatasets.push(
      dataset
    );

    imageryDatasets.sort(
      function (a, b) {

        return new Date(a.date) -
          new Date(b.date);

      }
    );

    closeImportDialog();

    renderImageryCatalogue();

    updateComparisonOptions();

    activateImagery(
      dataset.id,
      true
    );

    showToast(
      `${dataset.name} added successfully.`
    );

  } catch (error) {

    console.error(
      "GeoTIFF import error:",
      error
    );

    showToast(
      "Unable to load this GeoTIFF. Check its projection and file structure."
    );

  } finally {

    submitButton.disabled =
      false;

    submitButton.textContent =
      "Add to Map";

  }

}


// =========================
// ACTIVATE IMAGERY
// =========================

function activateImagery(
  datasetId,
  zoomToLayer = false
) {

  const dataset =
    imageryDatasets.find(
      function (item) {

        return item.id ===
          datasetId;

      }
    );

  if (
    !dataset
  ) {
    return;
  }

  if (
    activeImageryLayer
  ) {

    map.removeLayer(
      activeImageryLayer
    );

  }

  activeImageryId =
    dataset.id;

  activeImageryLayer =
    dataset.layer;

  activeImageryLayer.addTo(
    map
  );

  activeBasemap.bringToBack();

  if (
    zoomToLayer
  ) {

    map.fitBounds(
      activeImageryLayer.getBounds(),
      {
        padding: [
          30,
          30
        ],

        animate:
          true
      }
    );

  }

  zoomToImageryButton.disabled =
    false;

  selectedCount.textContent =
    "1";

  renderImageryCatalogue();

  showImageryDetails(
    dataset
  );

}


// =========================
// IMAGERY CATALOGUE
// =========================

function renderImageryCatalogue() {

  const searchValue =
    imagerySearchInput.value
      .trim()
      .toLowerCase();

  const filteredDatasets =
    imageryDatasets.filter(
      function (dataset) {

        return (
          dataset.name
            .toLowerCase()
            .includes(
              searchValue
            ) ||

          dataset.filename
            .toLowerCase()
            .includes(
              searchValue
            ) ||

          dataset.source
            .toLowerCase()
            .includes(
              searchValue
            )
        );

      }
    );

  imageryList.innerHTML =
    "";

  if (
    filteredDatasets.length === 0
  ) {

    imageryList.innerHTML =
      `
        <div class="empty-state">

          <div class="empty-state-icon">
            &#9638;
          </div>

          <h3>
            ${
              imageryDatasets.length === 0
                ? "No imagery loaded"
                : "No imagery found"
            }
          </h3>

          <p>
            ${
              imageryDatasets.length === 0
                ? "Add a GeoTIFF file to begin exploring imagery over time."
                : "Try using a different search term."
            }
          </p>

        </div>
      `;

  } else {

    filteredDatasets.forEach(
      function (dataset) {

        const card =
          document.createElement(
            "article"
          );

        card.className =
          "imagery-card";

        if (
          dataset.id ===
          activeImageryId
        ) {

          card.classList.add(
            "active"
          );

        }

        card.innerHTML =
          `
            <div class="imagery-thumbnail">
              GeoTIFF
            </div>

            <div class="imagery-card-content">

              <h3>
                ${escapeHtml(dataset.name)}
              </h3>

              <p>
                ${formatDate(dataset.date)}
              </p>

              <span class="imagery-source">
                ${escapeHtml(dataset.source)}
              </span>

            </div>

            <button
              class="imagery-card-action"
              type="button"
              title="Display imagery"
              aria-label="Display imagery"
            >
              &#8250;
            </button>
          `;

        card.addEventListener(
          "click",
          function () {

            activateImagery(
              dataset.id,
              true
            );

          }
        );

        imageryList.appendChild(
          card
        );

      }
    );

  }

  datasetCount.textContent =
    imageryDatasets.length;

}


// =========================
// IMAGERY DETAILS
// =========================

function showImageryDetails(dataset) {

  detailsTitle.textContent =
    dataset.name;

  detailsDate.textContent =
    formatDate(
      dataset.date
    );

  detailsFilename.textContent =
    dataset.filename;

  detailsFileSize.textContent =
    formatFileSize(
      dataset.fileSize
    );

  detailsCrs.textContent =
    dataset.projection;

  imageryDetailsPanel.hidden =
    false;

}


function closeImageryDetails() {

  imageryDetailsPanel.hidden =
    true;

}


function getActiveDataset() {

  return imageryDatasets.find(
    function (dataset) {

      return dataset.id ===
        activeImageryId;

    }
  );

}


// =========================
// COMPARISON OPTIONS
// =========================

function updateComparisonOptions() {

  const options =
    imageryDatasets
      .map(
        function (dataset) {

          return `
            <option value="${dataset.id}">
              ${escapeHtml(dataset.name)}
              — ${formatDate(dataset.date)}
            </option>
          `;

        }
      )
      .join("");

  beforeImagerySelect.innerHTML =
    `
      <option value="">
        Select imagery
      </option>
      ${options}
    `;

  afterImagerySelect.innerHTML =
    `
      <option value="">
        Select imagery
      </option>
      ${options}
    `;

  const hasEnoughImagery =
    imageryDatasets.length >= 2;

  beforeImagerySelect.disabled =
    !hasEnoughImagery;

  afterImagerySelect.disabled =
    !hasEnoughImagery;

  comparisonToggle.disabled =
    !hasEnoughImagery;

  swapComparisonButton.disabled =
    !hasEnoughImagery;

}


// Comparison will be implemented next

function handleComparisonToggle() {

  if (
    comparisonToggle.checked
  ) {

    comparisonToggle.checked =
      false;

    showToast(
      "The comparison engine will be connected in the next step."
    );

  }

  comparisonDivider.hidden =
    true;

}


// =========================
// DIALOG
// =========================

function closeImportDialog() {

  if (
    importDialog.open
  ) {

    importDialog.close();

  }

  importForm.reset();

  geotiffInput.value =
    "";

  pendingGeoTiffFile =
    null;

  selectedFileName.textContent =
    "No file selected";

}


// =========================
// SLIDERS
// =========================

function updateComparisonSlider() {

  const value =
    Number(
      comparisonSlider.value
    );

  comparisonSliderValue.textContent =
    `${value}%`;

  comparisonDivider.style.left =
    `${value}%`;

}


function updateOpacitySlider() {

  const value =
    Number(
      opacitySlider.value
    );

  opacitySliderValue.textContent =
    `${value}%`;

  if (
    activeImageryLayer
  ) {

    activeImageryLayer.setOpacity(
      value / 100
    );

  }

}


// =========================
// HELPERS
// =========================

function createDatasetId() {

  return (
    "imagery-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


function removeFileExtension(filename) {

  return filename.replace(
    /\.[^/.]+$/,
    ""
  );

}


function getProjectionLabel(
  projection
) {

  if (
    projection === undefined ||
    projection === null
  ) {

    return "Unknown";

  }

  const projectionText =
    String(
      projection
    );

  if (
    projectionText
      .toUpperCase()
      .startsWith(
        "EPSG:"
      )
  ) {

    return projectionText;

  }

  return `EPSG:${projectionText}`;

}


function formatDate(dateValue) {

  if (
    !dateValue
  ) {
    return "Unknown date";
  }

  const date =
    new Date(
      `${dateValue}T00:00:00`
    );

  return date.toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric"
    }
  );

}


function formatFileSize(bytes) {

  if (
    bytes === 0
  ) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];

  const unitIndex =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  const value =
    bytes /
    Math.pow(
      1024,
      unitIndex
    );

  return (
    value.toFixed(
      unitIndex === 0
        ? 0
        : 2
    ) +
    " " +
    units[unitIndex]
  );

}


function escapeHtml(value) {

  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    value;

  return element.innerHTML;

}


function showToast(message) {

  clearTimeout(
    toastTimeout
  );

  toastMessage.textContent =
    message;

  toast.hidden =
    false;

  toastTimeout =
    setTimeout(
      function () {

        toast.hidden =
          true;

      },
      3200
    );

}


// =========================
// MAP EVENTS
// =========================

map.on(
  "mousemove",
  updateMapCoordinates
);

map.on(
  "mouseout",
  clearMapCoordinates
);

map.on(
  "zoomend",
  updateZoomLevel
);


// =========================
// BUTTON EVENTS
// =========================

resetViewButton.addEventListener(
  "click",
  resetMapView
);

toggleBasemapButton.addEventListener(
  "click",
  switchBasemap
);

zoomToImageryButton.addEventListener(
  "click",
  zoomToActiveImagery
);

collapseSidebarButton.addEventListener(
  "click",
  collapseSidebar
);

expandSidebarButton.addEventListener(
  "click",
  expandSidebar
);

geotiffInput.addEventListener(
  "change",
  handleGeoTiffSelection
);

imagerySearchInput.addEventListener(
  "input",
  renderImageryCatalogue
);

importForm.addEventListener(
  "submit",
  importGeoTiff
);

closeImportDialogButton.addEventListener(
  "click",
  closeImportDialog
);

cancelImportButton.addEventListener(
  "click",
  closeImportDialog
);

closeDetailsButton.addEventListener(
  "click",
  closeImageryDetails
);

comparisonToggle.addEventListener(
  "change",
  handleComparisonToggle
);

comparisonSlider.addEventListener(
  "input",
  updateComparisonSlider
);

opacitySlider.addEventListener(
  "input",
  updateOpacitySlider
);


window.addEventListener(
  "resize",
  function () {

    map.invalidateSize();

  }
);


// =========================
// INITIALIZE APPLICATION
// =========================

loadBasemap(
  currentBasemapIndex
);

updateZoomLevel();

updateComparisonOptions();

renderImageryCatalogue();

resetMapView();

console.log(
  "BIMP-EAGA Border Imagery Viewer initialized."
);