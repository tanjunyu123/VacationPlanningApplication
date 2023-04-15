"use strict"

// - Authors: 1. Lim Zhe Yi 
//            2. Tan Jun Yu
//            3. Goh Chyi Yong
//            4. Hashveenderjeet Kaur          
// - University: Monash University Malaysia
// - Degree: E3001 Bachelor of Engineering (Honours)  
// - Last modified:  2021
// - Purpose: Displaying list of planned vacations


// Creating reference from the HTML element 
let displayRef = document.getElementById("vacationList")
let inputHTML = ""

//updating and inputting information
for( let index in vacationPlans.list)
{
    inputHTML += `<b> ${Number(index)+1}) Name of Plan: ${vacationPlans.list[index].name}  <b><br>

    <b> &nbsp&nbsp&nbsp Booking Date:  ${vacationPlans.list[index].date} </b><br>
    <b> &nbsp&nbsp&nbsp Start Location:  ${vacationPlans.list[index].location} </b><br>
    <b> &nbsp&nbsp&nbsp Vehicle Type:  ${vacationPlans.list[index].vehicle} </b><br>
    <b> &nbsp&nbsp&nbsp Total Distance:   ${vacationPlans.list[index].totalDistance} km </b><br>
    <b> &nbsp&nbsp&nbsp Number of Stops:  ${vacationPlans.list[index].POIs.length} </b><br>
    <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="directSummary(${index})">View</button><br><br>`
}

//displaying user data
displayRef.innerHTML = inputHTML

//directing each planned vacation to a specific summary 
function directSummary(index)
{
    localStorage.setItem(VACATION_KEY, index)
    window.location = "summary.html"
}