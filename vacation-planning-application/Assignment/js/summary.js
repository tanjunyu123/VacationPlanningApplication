"use strict";

// - Authors: 1. Lim Zhe Yi 
//            2. Tan Jun Yu
//            3. Goh Chyi Yong
//            4. Hashveenderjeet Kaur         
// - University: Monash University Malaysia
// - Degree: E3001 Bachelor of Engineering (Honours)  
// - Last modified:  2021
// - Purpose: To display the details of a specific planned vacation


// Display the map
mapboxgl.accessToken = MAPBOX_KEY
let map = new mapboxgl.Map({
  container: 'map',
  center: ["", ""],
  zoom: 14,
  style: 'mapbox://styles/mapbox/streets-v9'
});

// Use webservice to get the coordinates of the start location
let vacationIndex = localStorage.getItem(VACATION_KEY)

let places = [];

// Function to push the POIs in the local storage to the array of places
function reloadData() {
  for (let index in vacationPlans.list[vacationIndex].POIs) {
    places.push({ longitude: vacationPlans.list[vacationIndex].POIs[index].longitude, latitude: vacationPlans.list[vacationIndex].POIs[index].latitude })
  }
}


// Webservice to get the coordinates of the start location using address input by the user
sendWebServiceRequestForForwardGeocoding(vacationPlans.list[vacationIndex].location, "operateData")
//Declare start coordinates as the global variable
let startCoordinates = "";

// Function that runs after the webservice is called
function operateData(data) {
  // Declare the coordinates of the start location as a variable
  startCoordinates = data.results[0].geometry;

  // Declare the name of the start location as a variable
  let name = data.results[0].formatted

  // Push the coordinates of the start location into the array
  places.push({ longitude: startCoordinates.lng, latitude: startCoordinates.lat })

  // Set the map to center at the start location
  map.setCenter([startCoordinates.lng, startCoordinates.lat]);

  //Add marker to the start location 
  let marker = new mapboxgl.Marker({
    "color": "#FF0000",
  });

  // Set the marker using the coordinates of the start location
  marker.setLngLat([startCoordinates.lng, startCoordinates.lat]);
  // Add the marker of start location to the map
  marker.addTo(map)


  //Create pop up to display the details of the start location on the marker
  let popup = new mapboxgl.Popup({ offset: 45 });
  popup.setHTML(name);
  marker.setPopup(popup)
  popup.addTo(map)

  // Callback function so that the elements inside the array of places persist even after the page is refreshed
  reloadData()

  // Display the route when the page is refreshed 
  showRoute()


}

// Declare the following variables as global variables
let mapId = []
let sumDistance = 0

// Function to show route
function showRoute() {

  for (let i = 0; i < places.length - 1; i++) {
    // Webservice call to the route on the map
    sendXMLRequestForRoute(places[i].latitude, places[i].longitude, places[i + 1].latitude, places[i + 1].longitude, directionsCallback)
  }
}

// Callback function that runs after webservice is called
function directionsCallback(data) {
  console.log(data)

  // Declare object as a variable to store information of the route
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

  // Add the coordinates of the route to the property under the object variable
  for (let index in data.routes[0].geometry.coordinates) {
    object.data.geometry.coordinates.push(data.routes[0].geometry.coordinates[index])
  }

  // Create random id for the route 
  let newId = (Math.floor(Math.random() * 100000000)).toString();

  // Adding the route to the map
  map.addLayer({
    id: `${newId}`,
    type: "line",
    source: object,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#888", "line-width": 6 }
  });

  // Push the map id into the array named mapID
  mapId.push(newId)

  // Push the distance into the array named distanceArray
  let distance = ((data.routes[0].distance) / 1000).toFixed(3)
  sumDistance = sumDistance + Number(distance)

  // Set the total distance to the class VacationPlans
  vacationPlans.list[vacationIndex].totalDistance = (sumDistance).toFixed(3)

  // Update local storage 
  updateLSData(LIST_KEY,vacationPlans)

  // Display the details as summary
  displaySummary()

}

// Display all the POIs added as markers on the map
function displayPOIMarkers() {
  for (let index in vacationPlans.list[vacationIndex].POIs) {
    let longitude = vacationPlans.list[vacationIndex].POIs[index].longitude;
    let latitude = vacationPlans.list[vacationIndex].POIs[index].latitude;
    let placeName = vacationPlans.list[vacationIndex].POIs[index].name;

    // Create marker as a variable
    let marker = new mapboxgl.Marker({ "color": "#0000FF" });
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



// Create references of the HTML inputs 
let nameOfPlanRef = document.getElementById("nameOfPlan");
let startLocationRef = document.getElementById("startLocation");
let bookingDateRef = document.getElementById("bookingDate");
let vehicleTypeRef = document.getElementById("vehicleType");
let totalDistanceRef = document.getElementById("totalDistance")
let noOfPOIsRef = document.getElementById("noOfPOIs");

// Display the vacation details to the HTML page
function displaySummary() {
  nameOfPlanRef.innerHTML = vacationPlans.list[vacationIndex].name
  startLocationRef.innerHTML = vacationPlans.list[vacationIndex].location
  bookingDateRef.innerHTML = vacationPlans.list[vacationIndex].date
  vehicleTypeRef.innerHTML = vacationPlans.list[vacationIndex].vehicle
  noOfPOIsRef.innerHTML = vacationPlans.list[vacationIndex].POIs.length
  totalDistanceRef.innerHTML = sumDistance 
}

//directing the user to List of planned vacations page when user clicks save
function directListOfPlannedVacationsPage() {
  if (confirm("Are you sure you want to save this?")) {
    window.location = 'listofplannedvacations.html'
  }

}

// Cancel button that runs after cancel button is clicked
function cancel() {
  if (confirm("Are you sure you want to cancel?")) {
    // Remove the vacation plan from the local storage
    vacationPlans.list.splice(vacationIndex, 1)
    // Update LS 
    updateLSData(LIST_KEY, vacationPlans)
    // Direct to main page
    window.location = "mainpage.html"
  }
}

// Function that runs when the mainpage on the navigation drawer is clicked
function mainpage() {
  if (confirm("Are you sure you want to leave this page? Your progress will not be saved.")) {
    // Remove vacation plan from the local storage
    vacationPlans.list.splice(vacationIndex, 1)
    // Update LS
    updateLSData(LIST_KEY, vacationPlans)
  }
}

//function that removes unsaved progress
function listOfPlannedVacations() {
  if (confirm("Are you sure you want to leave this page? Your progress will not be saved.")) {
    // Remove vacation plan from the local storage
    vacationPlans.list.splice(vacationIndex, 1)
    // Update LS
    updateLSData(LIST_KEY, vacationPlans)
  }
}




