"use strict"

// - Authors: 1. Lim Zhe Yi 
//            2. Tan Jun Yu
//            3. Goh Chyi Yong
//            4. Hashveenderjeet Kaur             
// - University: Monash University Malaysia
// - Degree: E3001 Bachelor of Engineering (Honours)  
// - Last modified:  2021
// - Purpose: Adding and displaying point of interests


// Display the map
mapboxgl.accessToken = MAPBOX_KEY
let map = new mapboxgl.Map
  ({
    container: 'map',
    center: ["", ""],
    zoom: 14,
    style: 'mapbox://styles/mapbox/streets-v9'
  });

// declare a global variable to store the places
let places = []

// Use webservice to get the coordinates of the start location
let vacationIndex = localStorage.getItem(VACATION_KEY)

// Function to push the POIs in the local storage to the array of places
function reloadData() {
  for (let index in vacationPlans.list[vacationIndex].POIs) {
    places.push({ longitude: vacationPlans.list[vacationIndex].POIs[index].longitude, latitude: vacationPlans.list[vacationIndex].POIs[index].latitude })
  }
}



// Webservice to get the coordinates of the address input by user 
sendWebServiceRequestForForwardGeocoding(vacationPlans.list[vacationIndex].location, "operateData")

// declare the start coordinate as a global variable
let startCoordinates = ""

function operateData(data) {
  // Declare the coordinates of the start location as a variable
  startCoordinates = data.results[0].geometry;

  // Declare the name as the variable
  let name = data.results[0].formatted;

  // Adding the start location to the array named places
  places.push({ longitude: startCoordinates.lng, latitude: startCoordinates.lat })

  // Set the map to center at the start location
  map.setCenter([startCoordinates.lng, startCoordinates.lat]);

  //Add marker to the start location 
  let marker = new mapboxgl.Marker
    ({
      "color": "#FF0000",
      draggable: true
    });

  marker.setLngLat([startCoordinates.lng, startCoordinates.lat]);
  marker.addTo(map)

  // Function that runs when the marker is dragged to fine tune the accuracy of start location
  function onDragEnd() {
    const lngLat = marker.getLngLat();
    console.log(lngLat)
    // Webservice call using the longitude and latitude of new start location after the marker is relocated
    sendWebServiceRequestForReverseGeocoding(lngLat.lat, lngLat.lng, "runData")
  }

  marker.on('dragend', onDragEnd);

  // Set the address of start location as a popup
  let popup = new mapboxgl.Popup({ offset: 45 });
  popup.setHTML(name);
  marker.setPopup(popup)
  popup.addTo(map)

  // Callback function so that the elements inside the array of places persist even after the page is refreshed
  reloadData()

  // Display the route when the page is refreshed 
  showRoute()

}

// Callback function that runs when the webservice is called
function runData(data) {
  console.log(data)
  vacationPlans.list[vacationIndex].location = data.results[0].formatted;
  updateLSData(LIST_KEY, vacationPlans)
}

// Re-center the map to start location 
function reCenter() {
  map.setCenter([startCoordinates.lng, startCoordinates.lat]);
}


// Declare a global variable to store the POI markes as an array
let markerPOI = [];


// Add POI to the vacation plan
function confirmPOI() {
  if (confirm("Are you sure?")) {

    // Create reference from the HTML input field 
    let addressRef = document.getElementById("addressPOI")
    let address = addressRef.value

    // Use webservice to locate the longitude and latitude of POI
    sendWebServiceRequestForForwardGeocoding(address, "processData")

  }
}

// Call back function that runs after confirming POI
function processData(data) {
  console.log(data)

  let coordinates = data.results[0].geometry;
  console.log(coordinates)
  let name = data.results[0].formatted;

  // Move the center of the map to the new POI added
  map.panTo([coordinates.lng, coordinates.lat])

  // Add marker to the new POI added
  let marker = new mapboxgl.Marker({ "color": "#0000FF" });
  marker.setLngLat([coordinates.lng, coordinates.lat]);
  marker.addTo(map);

  // adding the POI's longitude and latitude to the array named places
  places.push({ longitude: coordinates.lng, latitude: coordinates.lat })

  // Create an instance of the POI class for the new POI added
  let POI = new PointOfInterest(name, coordinates.lng, coordinates.lat)

  // Add the instance of the class created into the vacation plan
  vacationPlans.addPOIs(POI, vacationIndex)

  // Update the local storage
  updateLSData(LIST_KEY, vacationPlans)

  // Set popup to the marker 
  let popup = new mapboxgl.Popup({ offset: 45 });
  popup.setHTML(name);
  marker.setPopup(popup)
  popup.addTo(map)

  // Push the marker to an array
  markerPOI.push(marker)

  // Update display 
  displayList()

  // Update route display on map
  showRoute()

}

// Declare the following variables as global variables
let mapId = []
let distanceArray = []
let rangeOfVehicle = "";
// Declare the range of each vehicle as a variable
let rangeOfSedan = 1000;
let rangeOfSUV = 850;
let rangeOfVan = 600;
let rangeOfMinibus = 450;

// Assign the correct range according to the type of vehicle chosen
function refuelVehicle() {
  if (vacationPlans.list[vacationIndex].vehicle === "Sedan") {
    rangeOfVehicle = rangeOfSedan
  }
  else if (vacationPlans.list[vacationIndex].vehicle === "SUV") {
    rangeOfVehicle = rangeOfSUV
  }
  else if (vacationPlans.list[vacationIndex].vehicle === "Van") {
    rangeOfVehicle = rangeOfVan
  }
  else if (vacationPlans.list[vacationIndex].vehicle === "Minibus") {
    rangeOfVehicle = rangeOfMinibus
  }
}
// Refuel the vehicle when the page loads
refuelVehicle()

//showing route on map
function showRoute() {
  // Refuel vehicle 
  refuelVehicle()


  for (let index in mapId) {
    map.removeLayer(mapId[index])
  }
  mapId = []
  distanceArray = []

  for (let i = 0; i < places.length - 1; i++) {
    sendXMLRequestForRoute(places[i].latitude, places[i].longitude, places[i + 1].latitude, places[i + 1].longitude, directionsCallback)
  }
}


//callback function
function directionsCallback(data) {

  console.log(data)

  let object = {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: []
      }
    }
  };

  // Loop through the coordinates of the routes and add them into the coordinates property under the object variable
  for (let index in data.routes[0].geometry.coordinates) {
    object.data.geometry.coordinates.push(data.routes[0].geometry.coordinates[index])
  }

  // Create a random id for each route to be displayed
  let newId = (Math.floor(Math.random() * 100000000)).toString();

  // Add the route to the map 
  map.addLayer({
    id: `${newId}`,
    type: "line",
    source: object,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#888", "line-width": 6 }
  });

  // Push the id into the mapID array
  mapId.push(newId)

  // Declare the distance of each leg as a variable
  let distance = ((data.routes[0].distance) / 1000).toFixed(3)
  // Push the distance into the global distanceArray
  distanceArray.push(Number(distance))

  // Remaining fuel by subtracting the distance of each leg
  rangeOfVehicle = rangeOfVehicle - distance

  // Update the table list to show the total distance and remaining fuel 
  displayList()


  // If the endurance of the vehicle less than 0, alert the user and suggest to add gas station as POI
  if (rangeOfVehicle < 0) {
    alert("Total distance exceeded range of vehicle. Please select a gas station as POI to refuel the vehicle")
  }


}
// Display all the POIs added as markers on the map
function displayPOIMarkers() {
  for (let index in vacationPlans.list[vacationIndex].POIs) {
    let longitude = vacationPlans.list[vacationIndex].POIs[index].longitude;
    let latitude = vacationPlans.list[vacationIndex].POIs[index].latitude;
    let placeName = vacationPlans.list[vacationIndex].POIs[index].name;

    // Create marker as a variable
    let marker = new mapboxgl.Marker({
      "color": "#0000FF",
    });
    marker.setLngLat([longitude, latitude]);

    // Add marker to the map
    marker.addTo(map)

    // Create popup to the marker
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(placeName);
    marker.setPopup(popup);
    // Display the popup on the marker
    popup.addTo(map);
  }
}

// Display the marker by calling the function
displayPOIMarkers()

// Declare total distance as global variable
let totalDistance = ""
// List down all the POIs added 
function displayList() {
  // Create reference from the HTML element
  let displayRef = document.getElementById("displayPOI");

  // Constructing a html table 
  let inputHTML = `<table> 
                   <thead> 
                   <tr>
                   <th>No.</th>
                   <th>Point of Interest</th>
                   <th>Distance (km)</th>
                   <th>Action</th>
                   </tr>
                   <tbody>`
  for (let index in vacationPlans.list[vacationIndex].POIs) {
    inputHTML += `<tr>
                  <td>${Number(index) + 1}</td>
                  <td>${vacationPlans.list[vacationIndex].POIs[index].name}</td>
                  <td>${distanceArray[index]}</td>
                  <td><button class="mdl-button mdl-js-button mdl-button--raised" onclick="removePOI(${index})">Remove</button>
                  <button class="mdl-button mdl-js-button mdl-button--raised" onclick="swap(${index})">Swap</button></td> 
                  </tr>
                  `
  }
  inputHTML += `</tbody></table>`

  // Calculate total distance using for loop 
  totalDistance = 0
  for (let index in distanceArray) {
    totalDistance += distanceArray[index];
  }

  // Displaying the total distance and remaining fuel 
  inputHTML += `<b> Total distance : ${totalDistance.toFixed(3)}km </b>`

  inputHTML += `<b> Remaining Fuel : ${rangeOfVehicle.toFixed(3)}km </b>`

  // Display the table to the html page
  displayRef.innerHTML = inputHTML
}

// Display the list of POIs
displayList()

// Swap orders of POI
function swap(index) {
  let index2 = prompt("Pick another number to be swapped with");
  // if user clicks cancel
  if (index2 == null) {
    return;
  }
  // Try again if empty input
  while (index2 == "") {
    alert("That input is invalid");
    index2 = prompt("Pick another number to be swapped with");
  }
  // Confirm swap 
  if (confirm(`Confirm to swap with ${index2}?`)) {
    // Swap the posititons of both the POIs
    let temp = vacationPlans.list[vacationIndex].POIs[index]
    vacationPlans.list[vacationIndex].POIs[index] = vacationPlans.list[vacationIndex].POIs[index2 - 1]
    vacationPlans.list[vacationIndex].POIs[index2 - 1] = temp

    // Swap the positions of the markers in the array
    let tempMarker = markerPOI[index]
    markerPOI[index] = markerPOI[index2 - 1]
    markerPOI[index2 - 1] = tempMarker

    // Swap positions of the places in the array
    let tempPlace = places[index + 1]
    places[index + 1] = places[index2]
    places[index2] = tempPlace

    // update LS
    updateLSData(LIST_KEY, vacationPlans);
    // update display
    displayList()

    // Upate route display on map
    showRoute()
  }
}

// Remove any of the POI added
function removePOI(index) {
  if (confirm("Are you sure?")) {

    // Remove the POI from local storage
    vacationPlans.list[vacationIndex].POIs.splice(index, 1)
    // Update the Local storage
    updateLSData(LIST_KEY, vacationPlans)

    // Remove marker from the map
    markerPOI[index].remove();
    // Remove marker from the array 
    markerPOI.splice(index, 1);
    // Remove the POI from the array places
    places.splice(index + 1, 1)

    //Update route display on map
    showRoute()

    // Update the list 
    displayList()
  }
}

// Declare global variables to store information in arrays
let markers = [];
let popUps = [];

// Show the nearest POIs around a location
function showPOI() {
  let category = document.getElementById("category").value


  // webservice calll to display nearest POIs
  if (places.length === 1) {
    if (category === "gas station") {
      sendXMLRequestForPlaces(category, places[0].longitude, places[0].latitude, displayGasStation);
    }
    else {
      sendXMLRequestForPlaces(category, places[0].longitude, places[0].latitude, displayPOI);
    }
  }
  else {
    if (category === "gas station") {
      sendXMLRequestForPlaces(category, places[places.length - 1].longitude, places[places.length - 1].latitude, displayGasStation);
    }
    else {
      sendXMLRequestForPlaces(category, places[places.length - 1].longitude, places[places.length - 1].latitude, displayPOI);
    }
  }
}


//Declare spots as global variable
let spots = []

// Callback function to display the 10 Nearest POIs in a list 
function displayPOI(data) {
  console.log(data)
  // remove marker
  removeMarker()
  // declare spots as a variable
  spots = []
  // generating a html table 
  let displayPOIRef = document.getElementById("displayNearestPOI")
  let inputHTML1 = `<table id="table"> 
                   <thead> 
                   <tr>
                   <th>No.</th>
                   <th>Point of Interest</th>
                   <th>Action</th>
                   </tr>
                   </thead>
                   <tbody>`

  // Declare the locations as a variable
  let locations = [];
  // Loop through the data.features and add them into locations 
  for (let index in data.features) {
    let each_feature = data.features[index]
    let coordinates = each_feature.geometry.coordinates
    let place_name = each_feature.place_name
    let obj = {
      coordinates: coordinates,
      place_name: place_name
    }
    locations.push(obj)
    spots.push(obj)

    // Continue generating HTMl table 
    inputHTML1 += `<tr>
                  <td>${Number(index) + 1}</td>
                  <td>${place_name}</td>
                  <td><button class="mdl-button mdl-js-button mdl-button--raised" onclick="addToPOI(${index})">Add</button></td> 
                  `
  }
  inputHTML1 += `</tbody></table>`
  // Display table generated to the html page
  displayPOIRef.innerHTML = inputHTML1

  // Move the map to the POIs 
  map.panTo(locations[0].coordinates)
  showMarkers(locations)
}

// Callback function to display 10 nearest gas stations
function displayGasStation(data) {
  console.log(data)
  // remove marker
  removeMarker()
  // declare spots as a variable
  spots = []
  // generating a html table
  let displayPOIRef = document.getElementById("displayNearestPOI")
  let inputHTML1 = `<table id="table"> 
                   <thead> 
                   <tr>
                   <th>No.</th>
                   <th>Point of Interest</th>
                   <th>Action</th>
                   </tr>
                   </thead>
                   <tbody>`

  // Declare the locations as a variable                 
  let locations = [];
  for (let index in data.features) {
    let each_feature = data.features[index]
    let coordinates = each_feature.geometry.coordinates
    let place_name = each_feature.place_name
    let obj = {
      coordinates: coordinates,
      place_name: place_name
    }
    locations.push(obj)
    spots.push(obj)

    // continue generating the HTML table
    inputHTML1 += `<tr>
                  <td>${Number(index) + 1}</td>
                  <td>${place_name}</td>
                  <td><button class="mdl-button mdl-js-button mdl-button--raised" onclick="addGasStation(${index})">Add</button></td> 
                  `
  }
  inputHTML1 += `</tbody></table>`
  // Display the generated table to the HTML page
  displayPOIRef.innerHTML = inputHTML1

  // Move the map to the POIs 
  map.panTo(locations[0].coordinates)
  showMarkers(locations)
}

//adding POI 
function addToPOI(index) {
  if (confirm("Are you sure ?")) {
    let latitude = spots[index].coordinates[1];
    let longitude = spots[index].coordinates[0];
    let address = spots[index].place_name

    places.push({ longitude: longitude, latitude: latitude })


    // Create a new instance of POI
    let newPOI = new PointOfInterest(address, longitude, latitude)

    // Create marker for the newly added POI
    let marker = new mapboxgl.Marker({ "color": "#0000FF" });
    marker.setLngLat([longitude, latitude]);
    marker.addTo(map);

    // Add new POI to the vacation plan 
    vacationPlans.addPOIs(newPOI, vacationIndex)
    //Update local storage
    updateLSData(LIST_KEY, vacationPlans)
    //Update list of POIs
    displayList()

    // Create a marker on the map with popup details
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(address);
    marker.setPopup(popup)
    popup.addTo(map)

    markerPOI.push(marker)

    //update route display on map
    showRoute()


  }

}

function addGasStation(index) {
  if (confirm("Are you sure ?")) {
    let latitude = spots[index].coordinates[1];
    let longitude = spots[index].coordinates[0];
    let address = spots[index].place_name

    places.push({ longitude: longitude, latitude: latitude })


    // Create a new instance of POI
    let newPOI = new PointOfInterest(address, longitude, latitude)

    // Create marker for the newly added POI
    let marker = new mapboxgl.Marker({ "color": "#0000FF" });
    marker.setLngLat([longitude, latitude]);
    marker.addTo(map);

    // Add new POI to the vacation plan 
    vacationPlans.addPOIs(newPOI, vacationIndex)
    //Update local storage
    updateLSData(LIST_KEY, vacationPlans)
    //Update list of POIs
    displayList()

    // Create a marker on the map with popup details
    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(address);
    marker.setPopup(popup)
    popup.addTo(map)

    markerPOI.push(marker)

    //update route display on map
    showRoute()


  }
}


// Show markers for locations 
function showMarkers(locations) {
  for (let i = 0; i < locations.length; i++) {
    let coordinates = locations[i].coordinates;
    let place_name = locations[i].place_name;

    let marker = new mapboxgl.Marker({ "color": "#FF8C00" });
    marker.setLngLat(coordinates);

    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(place_name);

    marker.setPopup(popup)

    // Display the marker.
    marker.addTo(map);

    // Display the popup.
    popup.addTo(map);

    markers.push(marker)
    popUps.push(popup)
  }
}

// Remove markers
function removeMarker() {
  for (let j in markers) {
    markers[j].remove();
    popUps[j].remove();
  }
  markers.length = 0;
  popUps.length = 0;
}

// Direct user to next page
function next() {
  window.location = "summary.html"
}

//directing user to the mainpage 
function mainpage() {
  if (confirm(" Are you sure you want to leave this page? Your progress will not be saved.")) {
    vacationPlans.list.splice(vacationIndex, 1)
    updateLSData(LIST_KEY, vacationPlans)
  }
}

//deleting user's current progress when user decides to leave the page
function listOfPlannedVacations() {
  if (confirm(" Are you sure you want to leave this page? Your progress will not be saved.")) {
    vacationPlans.list.splice(vacationIndex, 1)
    updateLSData(LIST_KEY, vacationPlans)
  }
}




