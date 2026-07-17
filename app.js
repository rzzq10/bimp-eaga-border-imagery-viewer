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

let aoilayer = null;

let activeImageryLayer = null;

let comparisonBeforeLayer = null;

let comparisonAfterLayer = null;

let previouslyVisibleDatasetIds = [];

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

const POSTPROCESSING_DATASETS = [

  {
    name:
      "Deforestation — Nov to Dec",

    periodLabel:
      "Nov 2025 – Dec 2025",

    startDate:
      "2025-11-01",

    endDate:
      "2025-12-01",

    filename:
      "LogDetMask_Nov-Dec.tif"
  },

  {
    name:
      "Deforestation — Dec to Jan",

    periodLabel:
      "Dec 2025 – Jan 2026",

    startDate:
      "2025-12-01",

    endDate:
      "2026-01-01",

    filename:
      "LogDetMask_Dec-Jan.tif"
  },

  {
    name:
      "Deforestation — Jan to Feb",

    periodLabel:
      "Jan 2026 – Feb 2026",

    startDate:
      "2026-01-01",

    endDate:
      "2026-02-01",

    filename:
      "LogDetMask_Jan-Feb.tif"
  },

  {
    name:
      "Deforestation — Feb to Mar",

    periodLabel:
      "Feb 2026 – Mar 2026",

    startDate:
      "2026-02-01",

    endDate:
      "2026-03-01",

    filename:
      "LogDetMask_Feb-Mar.tif"
  },

  {
    name:
      "Deforestation — Mar to Apr",

    periodLabel:
      "Mar 2026 – Apr 2026",

    startDate:
      "2026-03-01",

    endDate:
      "2026-04-01",

    filename:
      "LogDetMask_Mar-Apr.tif"
  },

  {
    name:
      "Deforestation — Overall",

    periodLabel:
      "Nov 2025 – Apr 2026",

    startDate:
      "2025-11-01",

    endDate:
      "2026-04-01",

    filename:
      "LogDetMask_Nov-Apr.tif"
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

const comparisonPanel =
  document.getElementById(
    "comparisonPanel"
  );

const minimizeComparisonButton =
  document.getElementById(
    "minimizeComparisonButton"
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

  map.createPane(
    "comparisonBeforePane"
  );

  map.createPane(
    "comparisonAfterPane"
  );

  map.getPane(
    "comparisonBeforePane"
  ).style.zIndex =
    350;

  map.getPane(
    "comparisonAfterPane"
  ).style.zIndex =
    360;


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

  if (
    aoiLayer &&
    aoiLayer.getBounds().isValid()
  ) {

    map.fitBounds(
      aoiLayer.getBounds(),
      {
        padding: [
          40,
          40
        ],

        animate:
          true,

        duration:
          0.8
      }
    );

    return;

  }

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

async function loadAreaOfInterest() {

  try {

    const response =
      await fetch(
        "./data/aoi/POC_Border.geojson"
      );

    if (
      !response.ok
    ) {

      throw new Error(
        `AOI request failed: ${response.status}`
      );

    }

    const geojson =
      await response.json();

    aoiLayer =
      L.geoJSON(
        geojson,
        {
          style: {
            color:
              "#f2c94c",

            weight:
              2.5,

            opacity:
              1,

            fillColor:
              "#f2c94c",

            fillOpacity:
              0.06,

            dashArray:
              "7 5"
          },

          onEachFeature:
            function (
              feature,
              layer
            ) {

              const area =
                feature.properties?.Area;

              const areaLabel =
                typeof area === "number"
                  ? `${area.toFixed(2)} km²`
                  : "Not available";

              layer.bindPopup(
                `
                  <strong>
                    BIMP-EAGA POC Area of Interest
                  </strong>

                  <br>

                  Area: ${areaLabel}
                `
              );

            }
        }
      )
      .addTo(
        map
      );

    aoiLayer.bringToFront();

    resetMapView();

    showToast(
      "BIMP-EAGA area of interest loaded."
    );

  } catch (error) {

    console.error(
      "AOI loading error:",
      error
    );

    showToast(
      "Unable to load the AOI GeoJSON."
    );

    resetMapView();

  }

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

function toggleComparisonPanel() {

  const isMinimized =
    comparisonPanel.classList.toggle(
      "minimized"
    );

  minimizeComparisonButton.innerHTML =
    isMinimized
      ? "+"
      : "&minus;";

  minimizeComparisonButton.title =
    isMinimized
      ? "Expand comparison panel"
      : "Minimize comparison panel";

  minimizeComparisonButton.setAttribute(
    "aria-label",
    minimizeComparisonButton.title
  );

}

async function loadPostProcessingDatasets() {

  let loadedCount =
    0;

  for (
    const config of
    POSTPROCESSING_DATASETS
  ) {

    try {

      const filePath =
        `./data/postprocessing/${config.filename}`;

      const response =
        await fetch(
          filePath
        );

      if (
        !response.ok
      ) {

        throw new Error(
          `${config.filename}: ${response.status}`
        );

      }

      const arrayBuffer =
        await response.arrayBuffer();

      const georaster =
        await parseGeoraster(
          arrayBuffer
        );

      const rasterLayer =
        new GeoRasterLayer(
          {
            projection:
              getProjectionLabel(
                georaster.projection
              ),

            georaster:
              georaster,

            opacity:
              1,

            resolution:
              256,

            pixelValuesToColorFn:
              function (values) {

                const value =
                  values[0];

                if (
                  value === 1
                ) {

                  return "rgba(255, 35, 35, 0.85)";

                }

                return null;

              }
          }
        );

      const dataset = {

        id:
          createDatasetId(),

        name:
          config.name,

        periodLabel:
          config.periodLabel,

        startDate:
          config.startDate,

        endDate:
          config.endDate,

        // Retained for current sorting logic
        date:
          config.endDate,

        source:
          "LC60 / Sentinel-1 VH",

        visible:
          false,

        filename:
          config.filename,

        fileSize:
          arrayBuffer.byteLength,

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

        georaster:
          georaster,

        layer:
          rasterLayer

      };

      imageryDatasets.push(
        dataset
      );

      loadedCount++;

    } catch (error) {

      console.error(
        "Postprocessing load error:",
        error
      );

    }

  }

  imageryDatasets.sort(
    function (a, b) {

      return (
        new Date(a.date) -
        new Date(b.date)
      );

    }
  );

  renderImageryCatalogue();

  updateComparisonOptions();

  if (
    loadedCount > 0
  ) {

    showToast(
      `${loadedCount} detection layers loaded.`
    );

  } else {

    showToast(
      "No postprocessing layers could be loaded."
    );

  }

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
          projection:
              getProjectionLabel(
                georaster.projection
              ),

          georaster:
            georaster,

          opacity:
            1,

          resolution:
            256,

          pixelValuesToColorFn:
            function (values) {

              const value =
                values[0];

              if (
                value === 1
              ) {

                return "rgba(255, 35, 35, 0.85)";

              }

              return null;

            }
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

      visible:
        false,

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

  activeImageryId =
    dataset.id;

  activeImageryLayer =
    dataset.layer;

  if (
    !dataset.visible
  ) {

    dataset.layer.addTo(
      map
    );

    dataset.visible =
      true;

  }

  activeBasemap.bringToBack();

  if (
    aoiLayer
  ) {

    aoiLayer.bringToFront();

  }

  if (
    zoomToLayer
  ) {

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

  zoomToImageryButton.disabled =
    false;

  updateVisibleLayerCount();

  renderImageryCatalogue();

  showImageryDetails(
    dataset
  );

}

function toggleImageryVisibility(
  datasetId
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
    dataset.visible
  ) {

    map.removeLayer(
      dataset.layer
    );

    dataset.visible =
      false;

  } else {

    dataset.layer.addTo(
      map
    );

    dataset.visible =
      true;

    activeImageryId =
      dataset.id;

    activeImageryLayer =
      dataset.layer;

    activeBasemap.bringToBack();

    if (
      aoiLayer
    ) {

      aoiLayer.bringToFront();

    }

    showImageryDetails(
      dataset
    );

  }

  updateVisibleLayerCount();

  renderImageryCatalogue();

}

function updateVisibleLayerCount() {

  const visibleLayers =
    imageryDatasets.filter(
      function (dataset) {

        return dataset.visible;

      }
    );

  selectedCount.textContent =
    visibleLayers.length;

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
                ${
                  dataset.periodLabel ||
                  formatDate(dataset.date)
                }
              </p>

              <span class="imagery-source">
                ${escapeHtml(dataset.source)}
              </span>

            </div>

            <button
              class="
                imagery-visibility-button
                ${dataset.visible ? "visible" : ""}
              "
              type="button"
              title="${
                dataset.visible
                  ? "Hide imagery"
                  : "Show imagery"
              }"
              aria-label="${
                dataset.visible
                  ? "Hide imagery"
                  : "Show imagery"
              }"
              aria-pressed="${dataset.visible}"
            >
              <span class="visibility-eye"></span>
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

        const visibilityButton =
          card.querySelector(
            ".imagery-visibility-button"
          );

        visibilityButton.addEventListener(
          "click",
          function (event) {

            event.stopPropagation();

            toggleImageryVisibility(
              dataset.id
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
    dataset.periodLabel ||
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

function createComparisonLayer(
  dataset,
  paneName
) {

  return new GeoRasterLayer(
    {
      georaster:
        dataset.georaster,

      pane:
        paneName,

      opacity:
        Number(
          opacitySlider.value
        ) / 100,

      resolution:
        256,

      pixelValuesToColorFn:
        function (values) {

          const value =
            values[0];

          if (
            value === 1
          ) {

            return "rgba(255, 35, 35, 0.9)";

          }

          return null;

        }
    }
  );

}


function clearComparisonLayers() {

  if (
    comparisonBeforeLayer &&
    map.hasLayer(
      comparisonBeforeLayer
    )
  ) {

    map.removeLayer(
      comparisonBeforeLayer
    );

  }

  if (
    comparisonAfterLayer &&
    map.hasLayer(
      comparisonAfterLayer
    )
  ) {

    map.removeLayer(
      comparisonAfterLayer
    );

  }

  comparisonBeforeLayer =
    null;

  comparisonAfterLayer =
    null;

}


function applyComparisonClip() {

  const sliderValue =
    Number(
      comparisonSlider.value
    );

  const afterPane =
    map.getPane(
      "comparisonAfterPane"
    );

  afterPane.style.clipPath =
    `inset(0 0 0 ${sliderValue}%)`;

  comparisonDivider.style.left =
    `${sliderValue}%`;

}


function renderComparisonLayers() {

  clearComparisonLayers();

  const beforeDataset =
    imageryDatasets.find(
      function (dataset) {

        return dataset.id ===
          beforeImagerySelect.value;

      }
    );

  const afterDataset =
    imageryDatasets.find(
      function (dataset) {

        return dataset.id ===
          afterImagerySelect.value;

      }
    );

  if (
    !beforeDataset ||
    !afterDataset
  ) {

    showToast(
      "Select a before and after dataset."
    );

    return;

  }

  if (
    beforeDataset.id ===
    afterDataset.id
  ) {

    showToast(
      "Choose two different detection periods."
    );

    return;

  }

  comparisonBeforeLayer =
    createComparisonLayer(
      beforeDataset,
      "comparisonBeforePane"
    );

  comparisonAfterLayer =
    createComparisonLayer(
      afterDataset,
      "comparisonAfterPane"
    );

  comparisonBeforeLayer.addTo(
    map
  );

  comparisonAfterLayer.addTo(
    map
  );

  activeBasemap.bringToBack();

  if (
    aoiLayer
  ) {

    aoiLayer.bringToFront();

  }

  applyComparisonClip();

}


function enableComparison() {

  if (
    imageryDatasets.length < 2
  ) {

    comparisonToggle.checked =
      false;

    showToast(
      "At least two datasets are required."
    );

    return;

  }

  const monthlyDatasets =
    imageryDatasets.filter(
      function (dataset) {

        return !dataset.name.includes(
          "Overall"
        );

      }
    );

  if (
    !beforeImagerySelect.value
  ) {

    beforeImagerySelect.value =
      monthlyDatasets[0]?.id ||
      imageryDatasets[0].id;

  }

  if (
    !afterImagerySelect.value
  ) {

    afterImagerySelect.value =
      monthlyDatasets[
        monthlyDatasets.length - 1
      ]?.id ||
      imageryDatasets[
        imageryDatasets.length - 1
      ].id;

  }

  previouslyVisibleDatasetIds =
    imageryDatasets
      .filter(
        function (dataset) {

          return dataset.visible;

        }
      )
      .map(
        function (dataset) {

          return dataset.id;

        }
      );

  imageryDatasets.forEach(
    function (dataset) {

      if (
        map.hasLayer(
          dataset.layer
        )
      ) {

        map.removeLayer(
          dataset.layer
        );

      }

    }
  );

  comparisonSlider.disabled =
    false;

  opacitySlider.disabled =
    false;

  comparisonDivider.hidden =
    false;

  renderComparisonLayers();

}


function disableComparison() {

  clearComparisonLayers();

  comparisonSlider.disabled =
    true;

  comparisonDivider.hidden =
    true;

  imageryDatasets.forEach(
    function (dataset) {

      if (
        previouslyVisibleDatasetIds.includes(
          dataset.id
        )
      ) {

        dataset.layer.addTo(
          map
        );

      }

    }
  );

  activeBasemap.bringToBack();

  if (
    aoiLayer
  ) {

    aoiLayer.bringToFront();

  }

  previouslyVisibleDatasetIds =
    [];

}


function handleComparisonToggle() {

  if (
    comparisonToggle.checked
  ) {

    enableComparison();

  } else {

    disableComparison();

  }

}


function swapComparisonDatasets() {

  const beforeValue =
    beforeImagerySelect.value;

  beforeImagerySelect.value =
    afterImagerySelect.value;

  afterImagerySelect.value =
    beforeValue;

  if (
    comparisonToggle.checked
  ) {

    renderComparisonLayers();

  }

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

  if (
    comparisonToggle.checked
  ) {

    applyComparisonClip();

  }

}

function updateOpacitySlider() {

  const value =
    Number(
      opacitySlider.value
    );

  opacitySliderValue.textContent =
    `${value}%`;

  const opacity =
    value / 100;

  if (
    comparisonToggle.checked
  ) {

    if (
      comparisonBeforeLayer
    ) {

      comparisonBeforeLayer.setOpacity(
        opacity
      );

    }

    if (
      comparisonAfterLayer
    ) {

      comparisonAfterLayer.setOpacity(
        opacity
      );

    }

    return;

  }

  if (
    activeImageryLayer
  ) {

    activeImageryLayer.setOpacity(
      opacity
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

beforeImagerySelect.addEventListener(
  "change",
  function () {

    if (
      comparisonToggle.checked
    ) {

      renderComparisonLayers();

    }

  }
);

afterImagerySelect.addEventListener(
  "change",
  function () {

    if (
      comparisonToggle.checked
    ) {

      renderComparisonLayers();

    }

  }
);

swapComparisonButton.addEventListener(
  "click",
  swapComparisonDatasets
);

comparisonSlider.addEventListener(
  "input",
  updateComparisonSlider
);

opacitySlider.addEventListener(
  "input",
  updateOpacitySlider
);

minimizeComparisonButton.addEventListener(
  "click",
  toggleComparisonPanel
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

loadAreaOfInterest();

loadPostProcessingDatasets();

console.log(
  "BIMP-EAGA Border Imagery Viewer initialized."
);