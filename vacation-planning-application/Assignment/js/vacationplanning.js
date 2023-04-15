"use strict"

// - Authors: 1. Lim Zhe Yi 
//            2. Tan Jun Yu
//            3. Goh Chyi Yong
//            4. Hashveenderjeet Kaur         
// - University: Monash University Malaysia
// - Degree: E3001 Bachelor of Engineering (Honours)  
// - Last modified:  2021
// - Purpose: Starting the vacation planning by inputting the details of the vacation plan


// Declare current location latitude and longitude as variables
let currentLat = "";
let currentLng = "";

// Use webservice to get user's current location
function getCurrentLocation() {
    getUserCurrentLocationUsingGeolocation(getUserLocationCallback);
}

// Callback function to get the latitude and longitude of the current location 
function getUserLocationCallback(lat, lng) {
    currentLat = lat;
    currentLng = lng;
    sendWebServiceRequestForReverseGeocoding(currentLat, currentLng, "processData")
}

// Callback function to get the address of the current location 
function processData(data) {
    console.log(data)
    // Create reference from the HTML field 
    let startLocationRef = document.getElementById("startLocation");
    let startLocation = data.results[0].formatted;

    // Assign the current location address to the input field for start location 
    startLocationRef.value = startLocation
}

// Confirm on the vacation details 
function confirmDetails() {
    // Create references from the HTML input fields 
    let vacationName = document.getElementById("vacationName").value
    let bookingDate = document.getElementById("bookingDate").value
    let startLocation = document.getElementById("startLocation").value
    let vehicle = document.getElementById("vehicleType").value

    // Ensure all input fields are filled before proceeding to the next html page
    if (vacationName === "" || bookingDate === "" || startLocation === "" || vehicle === "") {
        alert("Please ensure all input fields are filled")
    }
    else {
        if (confirm("Are you sure?")) {


            // Add the vacation plan using the details from the input by the user 
            vacationPlans.addVacationPlan(vacationName, startLocation, bookingDate, vehicle);

            // Update local storage
            updateLSData(LIST_KEY, vacationPlans)

            // Check the correct index for the vacation plan added 
            for (let index in vacationPlans.list) {
                if (vacationPlans.list[index].name === vacationName) {
                    localStorage.setItem(VACATION_KEY, index)
                }
            }

            // Direct user to the next page
            window.location = "addPOI.html"

        }
    }


}
