"use strict"

// - Authors: 1. Lim Zhe Yi 
//            2. Tan Jun Yu
//            3. Goh Chyi Yong
//            4. Hashveenderjeet Kaur    
// - University: Monash University Malaysia
// - Degree: E3001 Bachelor of Engineering (Honours)  
// - Last modified:  2021
// - Purpose: It will contain definition for classes and will share code that will be executed on 
//            all pages such as loading of data from local storage when page loads


class PointOfInterest
{
    //constructor
    constructor(name="",longitude,latitude)
    {
        this._name= name;
        this._latitude = latitude;
        this._longitude =longitude;
    
    }

    // accessors
    get name()
    {
        return this._name
    }
    get latitude()
    {
        return this._latitude
    }
    get longitude() 
    {
        return this._longitude;
    }

   
    //methods
    fromData(data)
    {
        this._name = data._name ;
        this._latitude = data._latitude;
        this._longitude = data._longitude;
    }
}
class VacationPlans
{
    //constructor
    constructor()
    {
        this._list = []
    }

    //accessors
    get list()
    {
        return this._list
    }

    //methods
    // Adding a vacation plan to the list with the properties of name,location,date,vehicle,totalDistance,POIs
    addVacationPlan(vacationName,startLocation,bookingDate,vehicleType)
    {
        let vacationPlan = {
            name: vacationName,
            location : startLocation,
            date : bookingDate,
            vehicle :vehicleType,
            totalDistance : 0,
            POIs : []   
        }
        // Push the vacation plan into the list 
        this._list.push(vacationPlan)
    }

    // Adding POI into a vacation plan using the POI and vacationIndex as parameters
    addPOIs(POI,vacationIndex)
    {
        if ( POI instanceof PointOfInterest)
        {
            this._list[vacationIndex].POIs.push(POI)
        }
    }

    // Removing POI from a vacation plan
    removePOI(indexPOI,vacationIndex)
    {
        this._list[vacationIndex].POIs.splice(indexPOI,1)
    }


    // Recreate an instance of the class 
    fromData(data)
    {
        this._list = [];
        for (let i = 0; i < data._list.length; i++)
        {
            let vacationPlan = {
                name: data._list[i].name,
                location : data._list[i].location,
                date:  data._list[i].date,
                vehicle :  data._list[i].vehicle,
                totalDistance : data._list[i].totalDistance,
                POIs : []
            };
            for (let j = 0; j < data._list[i].POIs.length; j++)
            {
                let tempPOI = new PointOfInterest();
                tempPOI.fromData(data._list[i].POIs[j]);
                vacationPlan.POIs.push(tempPOI);
            }
            this._list.push(vacationPlan);
        }
    }
}





// Declare global vacation plans variable
let vacationPlans = new VacationPlans()

// Check LS data
if (checkLSData(LIST_KEY))
{
    // If data exists, retrieve it
    let data = retrieveLSData(LIST_KEY);
    // Restore data into inventory
    vacationPlans.fromData(data);
}