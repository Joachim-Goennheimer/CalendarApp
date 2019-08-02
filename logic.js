today = new Date();
// getMonth() function starts counting from zero
currentMonth = today.getMonth();
currentYear = today.getFullYear();
currentDate = today.getDate();
currentDay = today.getDay();
currentHour = today.getHours();
currentMinutes = today.getMinutes();
yearDisplay = $("#yearDisplay");
monthDisplay = $("#monthDisplay");
dateDisplay = $("#dateDisplay");
timeHeader = $("#timeHeader");
calendarBody = $("#calendarBody");
nextButton = $("#nextButton");
previousButton = $("#previousButton");
createNewEntryButton = $("#createNewEntry");

// category Listeners
var allCategoriesDisplay = $("#allCategoriesDisplay");

// dateSpanListeners for weekView
sundayDateSpan = $("#sundayDateSpan");
mondayDateSpan = $("#mondayDateSpan");
tuesdayDateSpan = $("#tuesdayDateSpan");
wednesdayDateSpan = $("#wednesdayDateSpan");
thursdayDateSpan = $("#thursdayDateSpan");
fridayDateSpan = $("#fridayDateSpan");
saturdayDateSpan = $("#saturdayDateSpan");
weekViewButton = $("#weekView");


// input Form listeners
submitButton = $("#submitButton");
startTimeInput = $("#startTInput");
endTimeInput = $("#endTInput");
titleInput = $("#titleInput");
organizerInput = $('#organizerInput');
statusInput = $('#statusDropdown');
categoryInput = $('#categoryInput');
$('#statusDropdown').dropdown();
$('#categoryInput').popup();

// category Form listeners
firstload = true;
categoryPostForm = $("#categoryPostForm");
categoryPostButton = $("#categoryPostButton");
categoryNameInput = $("#categoryNameInput");


months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"];
// var allCategories = [{"id": 1, "name": "family"}, {"id": 2, "name": "church"}, {"id": 3, "name": "sport"}, {"id": 4, "name": "university"},
// {"id": 5, "name": "music"}];
var allCategories = [];
var selectedCategories = [];
// boolean that tracks whether program is in month or in week view.
// Necessary for next, previous buttons to work properly
inMonthView = true;

var eventData;

$(document).ready(function(){
    
    displayMonthView(currentMonth, currentYear);
    displayYearMonthDate(currentDate, currentMonth, currentYear);

    loadData();

    createNewEntryButton.click(function(){
        $('.ui.sidebar').sidebar('toggle');
    });


    calendarBasicLayoutListeners();
    postFormListeners();
    postCategory();
})

// *************************************************************************************************

// Loading Data

function loadData(){
    
    resetData();
    loadCategoryData().then(function(message){
        loadEventData().then(function(message){

            console.log(allCategories);
            displayCategories();
            displayEventsMonthView();
            
        })
        
    }).catch(function(message){
        console.log("Error loading data");
    })

}

function loadEventData(){
    console.log("loading events");

    return new Promise(function(resolve, reject){

        $.get("https://dhbw.cheekbyte.de/calendar/500/events", function(data){
        eventData = data;
        resolve("success");
        reject("loading error");
        })
    });

}

function loadCategoryData(){
    console.log("loading categories");
    return new Promise(function(resolve, reject){

        $.get("https://dhbw.cheekbyte.de/calendar/500/categories", function(data){
        allCategories = data;
        resolve("success");
        reject("loading error");
        })
    });
}

function resetData(){
    eventData = [];
    allCategories = [];
}

// *************************************************************************************************





// *************************************************************************************************
// Basic Calendar Layout


function displayYearMonthDate(date, month, year){
    dateDisplay.text(date);
    yearDisplay.text(year);
    monthDisplay.text(months[month]);
}

function displayMonthView(month, year){

    timeHeader.hide();
    hideDateSpans();

    calendarBody.empty();
    tableContent = "";
    daysInMonth = calculateDaysInMonth(month, year);
    let startDay = (new Date(year, month)).getDay();

    dateCounter = 1;
    for(i = 0; i < 6; i++){

        row = "<tr>";

        for(j = 0; j < 7; j++){


            // empty cell
            if(i === 0 && j < startDay){
                column = "<td>";

            }
            // normal entries
            else if(dateCounter <= daysInMonth){
                // adding id to column
                var columnID = calculateIDMonthView(year, month, dateCounter);
                // console.log("columnID: " + columnID);
                column = "<td id='" + columnID + "'>";
                column = column + "<h1>" + dateCounter + "</h1>";
                dateCounter++;
            }
            else{
                column = "<td>";
            }

            column = column + "</td>";
            row = row + column;
        }


        row = row + "</tr>";
        tableContent = tableContent + row;
    }

    calendarBody.append(tableContent);

}



function displayEventsMonthView(){

    var eventStartString;

    var eventYear;
    var eventMonth;
    var eventDate;

    var eventDateID;
    var eventDIV;

    eventData.forEach(function(event){

        eventStartString = event.start;

        eventYear = eventStartString.slice(0, 4);
        eventMonth = eventStartString.slice(5, 7);

        // because currentMonth is only one digit if below 10
        if(eventMonth.slice(0, 1) === "0"){
            eventMonth = "" + eventMonth.slice(1);
        }

        eventDate = eventStartString.slice(8, 10);

        eventYear = parseInt(eventYear);
        eventMonth = parseInt(eventMonth);
        eventDate = parseInt(eventDate);

        // if(eventYear === currentYear && eventMonth === currentMonth){

            eventDateID = calculateIDMonthView(eventYear, eventMonth, eventDate);
            eventDIV = generateEventDIV(event);
            var eventDateCell = $("#" + eventDateID);

            // cell cleared first because event might already be displayed
            eventDateCell.empty();
            eventDateCell.append(eventDIV);
        // }

    })

}

function displayEventsWeekView(){
    var eventStartString;

    var eventYear;
    var eventMonth;
    var eventDate;

    var eventDateID;
    var eventDIV;

    eventData.forEach(function(event){

        eventStartString = event.start;

        eventYear = eventStartString.slice(0, 4);
        eventMonth = eventStartString.slice(5, 7);
        eventDate = eventStartString.slice(8, 10);
        eventHour = eventStartString.slice(11, 13);
        eventMinutes = eventStartString.slice(15, 17);

        // because currentMonth is only one digit if below 10
        if(eventMonth.slice(0, 1) === "0"){
            eventMonth = "" + eventMonth.slice(1);
        }


        eventYear = parseInt(eventYear);
        eventMonth = parseInt(eventMonth);
        eventDate = parseInt(eventDate);
        eventHour = parseInt(eventHour);
        eventMinutes = parseInt(eventMinutes);
            
            eventDateID = calculateIDWeekView(eventYear, eventMonth, eventDate, eventHour, eventMinutes);
            eventDIV = generateEventDIV(event);
            
            var eventDateCell = $("#" + eventDateID);
            eventDateCell.empty();
            eventDateCell.append(eventDIV);        


    })

}


function nextMonth(){
    var daysInMonth = calculateDaysInMonth(currentMonth, currentYear);
    // calculates the date of the next saturday
    var lastDateOfWeek = currentDate - currentDay + 6;
    // console.log("*******************************************");
    // console.log("currentDate: " + currentDate);
    // console.log("currentDay: " + currentDay);
    // console.log("lastDateOfWeek: " + lastDateOfWeek);

    // if the last saturday has a higher date than possible the lastDateOfWeek is not on a saturday which means that the month ends prior in the week
    if(lastDateOfWeek > daysInMonth){
        lastDateOfWeek = daysInMonth;
        // console.log("IN IF - lastDateOfWeek: " + lastDateOfWeek);
    }
    // calculates the days that are left in the month
    var daysLeftInMonth = daysInMonth - currentDate;
    // console.log("daysLeftInMonth: " + daysLeftInMonth);
    if(currentMonth === 11){
        currentYear++;
        currentMonth = 0;
        currentDate = 7 - (daysLeftInMonth % 7);
        // console.log("currentDate: " + currentDate);
    }
    else{
        currentMonth++;
        // calculates the new current date displayed. It will always be the same day of the week as in the month before.
        currentDate = 7 - (daysLeftInMonth % 7);
        // console.log("currentDate: " + currentDate);
    }
    
}

function nextWeek(){
    
    var daysInMonth = calculateDaysInMonth(currentMonth, currentYear);
    // console.log("*******************************************");
    // console.log("daysInMonth: " + daysInMonth);
    var lastDateOfWeek = currentDate - currentDay + 6;
    if(lastDateOfWeek > daysInMonth){
        lastDateOfWeek = daysInMonth;
    }
    // console.log("lastDateOfWeek: " + lastDateOfWeek);

    var daysLeftInMonth = daysInMonth - currentDate;
    // console.log("daysLeftInMonth: " + daysLeftInMonth);

    if(daysLeftInMonth < 7){
        if(currentMonth === 11){
            currentYear++;
            currentMonth = 0;
        }
        else{
            currentMonth++;
        }
        currentDate = 7 - daysLeftInMonth;
        // console.log("Current Date: " + currentDate);
    }
    else{
        currentDate += 7;
    }
    
}

function previousMonth(){
    daysInPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear)
    // console.log("#############################################");
    // console.log("daysInPrevMonth: " + daysInPrevMonth);
    if(currentMonth === 0){
        currentYear--;
        currentMonth = 11;
    }
    else{
        currentMonth--;
    }
    // console.log("currenMonth: " + currentMonth);
    currentDate = daysInPrevMonth - ( 7 - (currentDate % 7) );
    // console.log("currentDate: " + currentDate);
    
}

function previousWeek(){
    var daysInPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear)
    // var daysInPrevMonth;
    if(currentDate <= 7){
        if(currentMonth === 0){
            currentYear--;
            currentMonth = 11;
        }
        else{
            currentMonth--;
        }
        
        currentDate = daysInPrevMonth - (7 - currentDate);
    }
    else{
        currentDate -= 7;
    }
    
}

function displayWeekView(minutes, hour, day, date, month, year){

    inMonthView = false;
    
    timeTracker = new Date();
    timeTracker.setHours(00);
    timeTracker.setMinutes(00);
    
    // console.log("hours: " + hours);
    // console.log("minutes: " + minutes);

    timeHeader.show();
    calendarBody.empty();

    tableContent = "";

    displayDateSpans(day, date);

    for(i = 0; i < 48; i++){

        hours = timeTracker.getHours();
        minutes = timeTracker.getMinutes();
        if(hours < 10){
            hoursString = "0" + hours;
        }
        else{
            hoursString = hours;
        }
        if(minutes === 0){
            minutesString = "0" + minutes;
        }
        else{
            minutesString = minutes;
        }

        row = "<tr>";
        firstcolumn = "<td>" + hoursString + ":" + minutesString + "</td>"
        row = row + firstcolumn;
        if(minutes === 30){
            timeTracker.setHours(hours + 1);
            timeTracker.setMinutes(00);
        }
        else{
            timeTracker.setMinutes(30);
        }
        
        for(j = 0; j < 7; j++){

            var columnID = setIDWeekView(j, day, date, hoursString, minutesString);
            // console.log("dateID: " + columnID);
            var column = "<td id='" + columnID + "'>";


            column = column + "</td>";
            row = row + column;

        }

        row = row + "</tr>";
        tableContent = tableContent + row;
    }

    calendarBody.append(tableContent);

}

function displayDateSpans(day, date){

    var daysinPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear);
    var daysInCurrentMonth = calculateDaysInMonth(currentMonth, currentYear);
    // console.log(date-day);
    var weekDates = [];

    dateNamingCounter = date-day;
    // displays dates that were part of the last month
    while(dateNamingCounter < 1){
        weekDates.push(daysinPrevMonth + dateNamingCounter);
        dateNamingCounter++;
    }
    // displays dates that are part of the current month
    while(weekDates.length < 7){
        // checks whether need to display dates from next month already
        if(dateNamingCounter > daysInCurrentMonth){
            dateNamingCounter = 1;
        }
        weekDates.push(dateNamingCounter);
        dateNamingCounter++;
    }

    sundayDateSpan.text(weekDates[0]);
    mondayDateSpan.text(weekDates[1]);
    tuesdayDateSpan.text(weekDates[2]);
    wednesdayDateSpan.text(weekDates[3]);
    thursdayDateSpan.text(weekDates[4]);
    fridayDateSpan.text(weekDates[5]);
    saturdayDateSpan.text(weekDates[6]);
}

function calculateIDMonthView(year, month, date){
    return "" + year + "-" + month + "-" + date;

}
// function that sets the ids in the current week View displayed to the user
function setIDWeekView(dayToCalculate, day, date, hour, minutes){

    var daysinPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear);
    var daysInCurrentMonth = calculateDaysInMonth(currentMonth, currentYear);
    // console.log(date-day);
    var weekDates = [];

    dateNamingCounter = date-day;
    // displays dates that were part of the last month
    while(dateNamingCounter < 1){
        weekDates.push(daysinPrevMonth + dateNamingCounter);
        dateNamingCounter++;
    }
    // displays dates that are part of the current month
    while(weekDates.length < 7){
        // checks whether need to display dates from next month already
        if(dateNamingCounter > daysInCurrentMonth){
            dateNamingCounter = 1;
        }
        weekDates.push(dateNamingCounter);
        dateNamingCounter++;
    }

    return "" + currentYear + "-" + currentMonth + "-" + weekDates[dayToCalculate] + "T" + hour + minutes;


}

// function that calculates the id for a certain event in order to check whether that id is currently displayed to the user
function calculateIDWeekView(year, month, date, hour, minutes){

    if(hour < 10){
        hour = "0" + hour;
    }

    if(minutes < 30){
        minutes = "00"
    }
    else{
        minutes = "30";
    }

    return "" + year + "-" + month + "-" + date + "T" + hour + minutes;
    
}

function hideDateSpans(){
    sundayDateSpan.text("");
    mondayDateSpan.text("");
    tuesdayDateSpan.text("");
    wednesdayDateSpan.text("");
    thursdayDateSpan.text("");
    fridayDateSpan.text("");
    saturdayDateSpan.text("");
}

function calendarBasicLayoutListeners(){
    nextButton.click(function(){
        if(inMonthView){
            nextMonth();
            displayYearMonthDate(currentDate, currentMonth, currentYear);
            displayMonthView(currentMonth, currentYear);
            displayEventsMonthView();
        }
        else{
            nextWeek();
            displayYearMonthDate(currentDate, currentMonth, currentYear);
            displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
            displayEventsWeekView();
        }
    });

    previousButton.click(function(){
        if(inMonthView){
            previousMonth();
            displayYearMonthDate(currentDate, currentMonth, currentYear);
            displayMonthView(currentMonth, currentYear);
            displayEventsMonthView();
        }
        else{
            previousWeek();
            displayYearMonthDate(currentDate, currentMonth, currentYear);
            displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
            displayEventsWeekView();
        }
    });

    weekViewButton.click(function(){
        if(inMonthView){
            inMonthView = false;
            displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
            displayEventsWeekView();
            weekViewButton.text("Month View");
        }
        else{
            inMonthView = true;
            displayMonthView(currentMonth, currentYear)
            displayEventsMonthView();
            weekViewButton.text("Week View");

        }
    })
}

function generateEventDIV(event){

    var htmlString = '<div id="' + event.id + '"';
    htmlString += '<h3>' + event.title + '</h3>';

    htmlString += '</div>';

    return htmlString;

}

// *************************************************************************************************



// *************************************************************************************************
// utlility functions

function calculateDaysInMonth(month, year){

    return 32 - new Date(year, month, 32).getDate();
}

function calculateDaysPrevMonth(month, year){

    if(currentMonth === 0){
        return calculateDaysInMonth(11, year-1);
    }
    else{
        return calculateDaysInMonth(month-1, year);
    }

}

function arrayRemove(arr, value) {

    return arr.filter(function(ele){
        return ele != value;
    });
 
 }

 // *************************************************************************************************


// *************************************************************************************************
// Categories: Create and Delete and Display

function displayCategories(){

    var categoryItem;
    allCategoriesDisplay.empty();

    allCategories.forEach(function(category){

        categoryItem = generateCategoryItem(category);
        allCategoriesDisplay.append(categoryItem);

        // click listener for selecting and deselecting a category
        $("#" + category.id).bind("click", function(){
            if(selectedCategories.includes(category)){
                console.log(category.name + " is in selected Categories");
                selectedCategories = arrayRemove(selectedCategories, category);
                $("#" + category.id).removeClass("selectCategory");
            }
            else{
                selectedCategories.push(category);
                $("#" + category.id).addClass("selectCategory");
            }
        })
        // click listener for deleting a category

        $("#deleteSpan" + category.id).bind("click", function(){
            deleteCategory(category.id);
        })
    })

}


function postCategory(){

    categoryPostButton.on("click", function(){
        
        var postData = {"name" : categoryNameInput.val()}
        var formData = JSON.stringify(postData);
        $.ajax({
            type: "POST",
            url: "https://dhbw.cheekbyte.de/calendar/500/categories",
            data: formData,
            success: function(){
                console.log("Successfully posted category");
            },
            dataType: "json",
            contentType : "application/json"
          }).done(function(response){
              allCategories = [];
              console.log(response);
              loadData();

          })


    })
}

function deleteCategory(categoryID){

    $.ajax({
        type: "DELETE",
        url: "https://dhbw.cheekbyte.de/calendar/500/categories/" + categoryID,
        success: function(){
            console.log("Successfully deleted category");
        },
      }).done(function(response){
          console.log(response);
          loadData();
      })

}

// only used when calendar is loaded the first time
function selectAllCategories(){
    selectedCategories = [];
    allCategories.forEach(function(category){
        selectedCategories.push(category);
    })
}


// HTML creators

function generateCategoryItem(category){

    var nameParagraph = '<p>' + category.name + '</p>';
    var deleteSpan = '<span id="deleteSpan' + category.id + '">X</span>';

    var htmlString = '<li id="' + category.id + '"';
    htmlString += nameParagraph;
    htmlString += deleteSpan;

    htmlString += '</li>';
    console.log(htmlString);

    return htmlString;
}

// *************************************************************************************************




// *************************************************************************************************
// Entries: Create, Edit and Delete


function postFormListeners(){

    titleInput.change(function() {
        getAndCheckTitleInput();
    
      })
    
      organizerInput.change(function() {
      checkAndGetOrganizerInput();
    })
    
    startTimeInput.change(function() {
        getAndCheckStartInput();
      })
    
      endTimeInput.change(function() {
        getAndCheckEndInput();
      })
    
      statusInput.change(function() {
        getStatusInput();
      })
    
        
        
          // remove popup after mouse leaves submit button
      document.getElementById('submitButton').onmouseout = function(event) {
        submitButton.popup('destroy');
    }
        
        
    submitButton.click(function() {
    
    var locationValue = document.getElementById("locationInput").value;
    var websiteValue = document.getElementById("websiteInput").value;
    var alldayValue = $('input[name=allday]').is(':checked');
    
        // reformat time input and add it if allday is true
        if(alldayValue) {
            startTimeInput = "00:00";
            endTimeInput = "23:59";
        }
    
    
        // get and get values of all mandatory fields
        // if not given mark them as incomplete
        var titleValue = getAndCheckTitleInput();
        var organizerValue = checkAndGetOrganizerInput();
        var startTimeValue = getAndCheckStartInput();
        var endTimeValue = getAndCheckEndInput();
        var statusValue = getStatusInput();
    
        var inputIsValid = true;
    
        // check if all data was entered correctly
        if(!titleValue || !organizerInput || !startTimeInput || !endTimeInput || !statusInput) {
            inputIsValid = false;
    
            submitButton.popup();
            submitButton.popup('show');
        }
    
    
        // if all the necessary input is give correctly a request can be made
        if(inputIsValid) {
    
            // add time formatting
            startTimeInput = "2019-06-24T" + startTimeInput;
            endTimeInput = "2019-06-24T" + endTimeInput;
    
    
            // make request with data
            var dummyRequest = '{ "title": "' + titleValue + '", "location": "' + locationValue + '", "organizer": "' + organizerValue + '", "start": "' + startTimeValue + '", "end": "' + endTimeValue + '", "status": "' + statusValue + '", "allday": ' + alldayValue + ', "webpage": "' + websiteValue + '" }';
            console.log(dummyRequest);
        }
    
        // $.post("https://dhbw.cheekbyte.de/calendar/500/events", JSON.parse(requestData), function(status) {
        //   console.log(status);
        // });
    
    });
}



// check current input data
function getAndCheckTitleInput() {

    var titleInputValue = document.getElementById("titleInput").value;
    if(titleInputValue == "") {
        document.getElementById('titleInput').classList.add("red");
        return false;
    } else {
        document.getElementById('titleInput').classList.remove("red");
        return titleInputValue;
    }
    }

function checkAndGetOrganizerInput() {

var organizerInputValue = document.getElementById("organizerInput").value;
if (organizerInputValue == "") {

    inputIsValid = false;
    document.getElementById('organizerInput').classList.add("red");
    return false;
} else {

    document.getElementById('organizerInput').classList.remove("red");
    return organizerInputValue;
    }

}

function getAndCheckStartInput() {
    var startTimeInputValue = document.getElementById("startTInput").value;
    var timeRegex = new RegExp(/^\d{2}:\d{2}$/);
  
    if (startTimeInputValue == "" || !timeRegex.test(startTimeInputValue)) {
  
      document.getElementById('startTInput').classList.add("red");
      inputIsValid = false;
    } else {
  
      document.getElementById('startTInput').classList.remove("red");
      return startTimeInputValue;
    }
  }
    
  
  
  function getAndCheckEndInput() {
    var endTimeInputValue = document.getElementById("endTInput").value;
    var timeRegex = new RegExp(/^\d{2}:\d{2}$/);
  
    if (endTimeInput == "" || !timeRegex.test(endTimeInputValue)) {
  
      document.getElementById('endTInput').classList.add("red");
      return false;
    } else {
      document.getElementById('endTInput').classList.remove("red");
      return endTimeInputValue;
    }
  }
    
  
  
  function getStatusInput() {
    var statusInputValue = $('#statusDropdown').dropdown('get value');
  
    if (statusInputValue == "") {
  
      document.getElementById('statusDropdown').classList.add("red");
    } else {
  
      document.getElementById('statusDropdown').classList.remove("red");
    }
    return statusInputValue;
  }
    
  
  
      
        // function checkInputLength(input, length) {
    //
    //   if(input.length < length + 1) {
    //     console.log("String has valid length");
    //   } else {
    //     console.log("Invalid length");
    //   }
    //
    // }