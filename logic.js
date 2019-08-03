var today = new Date();
// getMonth() function starts counting from zero

var currentMonth = today.getMonth();
var currentYear = today.getFullYear();
var currentDate = today.getDate();
var currentDay = today.getDay();
var currentHour = today.getHours();
var currentMinutes = today.getMinutes();
var yearDisplay = $("#yearDisplay");
var monthDisplay = $("#monthDisplay");
var dateDisplay = $("#dateDisplay");
var timeHeader = $("#timeHeader");
var calendarBody = $("#calendarBody");
var nextMonthOrWeekButton = $("#nextMonthOrWeekButton");
var previousMonthOrWeekButton = $("#previousMonthOrWeekButton");
var nextYearButton = $("#nextYearButton");
var previousYearButton = $("#previousYearButton");

var createNewEntryButton = $("#createNewEntry");

// category Listeners
var allCategoriesDisplay = $("#allCategoriesDisplay");

// dateSpanListeners for weekView
var sundayDateSpan = $("#sundayDateSpan");
var mondayDateSpan = $("#mondayDateSpan");
var tuesdayDateSpan = $("#tuesdayDateSpan");
var wednesdayDateSpan = $("#wednesdayDateSpan");
var thursdayDateSpan = $("#thursdayDateSpan");
var fridayDateSpan = $("#fridayDateSpan");
var saturdayDateSpan = $("#saturdayDateSpan");
var weekViewButton = $("#weekView");


// input Form listeners
var submitButton = $("#submitButton");
var startTimeInput = $("#startTInput");
var endTimeInput = $("#endTInput");
var titleInput = $("#titleInput");
var organizerInput = $('#organizerInput');
var statusInput = $('#statusDropdown');
var categoryInput = $('#categoryInput');
var imageInput = $("#imageInput");
var startDate = $('#startDate');
var endDate = $('#endDate');
var alldayInput = $('#alldayInput');
$('#statusDropdown').dropdown();
$('#categoryDropdown').dropdown();
$('#categoryDropdown').dropdown('clear');


// category Form listeners
var categoryPostForm = $("#categoryPostForm");
var categoryPostButton = $("#categoryPostButton");
var categoryNameInput = $("#categoryNameInput");
var deleteCategoryModal = $("#deleteCategoryModal");
var confirmDeleteCategoryButton = $("#confirmDeleteCategoryButton");

var deleteEventModal = $("#deleteEventModal");
var confirmDeleteEventButton = $("#confirmDeleteEventButton");


var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"];
var allCategories = [];
var hideCategories = [];

// boolean that tracks whether program is in month or in week view.
// Necessary for next, previous buttons to work properly
var inMonthView = true;

var eventData;

$(document).ready(function(){


    displayMonthView(currentMonth, currentYear);
    displayYearMonthDate(currentDate, currentMonth, currentYear);

    loadData();


    createNewEntryButton.click(function(){
        $('.ui.sidebar').sidebar('toggle');
        refreshFormInput();
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
    var currentDateID;
    let startDay = (new Date(year, month)).getDay();

    dateCounter = 1;
    for(i = 0; i < 6; i++){

        row = "<tr>";

        for(j = 0; j < 7; j++){


            // empty cell
            if(i === 0 && j < startDay){
                column = "<td class='dayCellMonthView'>";

            }
            // normal entries
            else if(dateCounter <= daysInMonth){
                // adding id to column
                var columnID = calculateIDMonthView(year, month, dateCounter);
                // console.log("columnID: " + columnID);
                column = "<td id='" + columnID + "' class='dayCellMonthView'>";
                column = column + "<h1>" + dateCounter + "</h1>";
                dateCounter++;
            }
            else{
                column = "<td class='dayCellMonthView'>";
            }

            column = column + "</td>";
            row = row + column;
        }


        row = row + "</tr>";
        tableContent = tableContent + row;
    }

    calendarBody.append(tableContent);

    // mark current date

    currentDateID = calculateIDMonthView(currentYear, currentMonth, currentDate);

    $("#" + currentDateID).addClass("currentDateStyle");
}

function displayEventsMonthView(){

    var eventStartString;

    var eventYear;
    var eventMonth;
    var eventDate;

    var eventDateID;
    var eventDIV;

    var hideEvent;


    console.log("hideCategories: " + hideCategories)

    eventData.forEach(function(event){

        hideEvent = true;
        // check whether all of the events categories are in the hideCategoryArray

        console.log("Event: " + event.title + " has categories: ");

        if(event.categories.length > 0){
            event.categories.forEach(function(category){

                console.log(category.id);
                console.log("**********************");

                if(!hideCategories.includes(category.id)){
                    console.log("hideEvent set to false");
                    hideEvent = false;
                }
            })
        }
        else{
            hideEvent = false;
        }

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
            eventDIV = generateEventDIV(event, hideEvent);
            var eventDateCell = $("#" + eventDateID);

        // cell cleared first because event might already be displayed

            var formerEventDiv = $("#" + event.id);
            formerEventDiv.remove();

            // eventDateCell.empty();
            eventDateCell.append(eventDIV);
            $("#deleteSpan" + event.id).on("click", function(){

                deleteEventModal.modal({
                    onApprove : function(){
                        $("#" + event.id).remove();
                        deleteEvent(event.id);
                    }

                }).modal("show");

            })

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

    var hideEvent;

    eventData.forEach(function(event){

        hideEvent = true;
        // check whether all of the events categories are in the hideCategoryArray

        console.log("Event: " + event.title + " has categories: ");

        if(event.categories.length > 0){
            event.categories.forEach(function(category){

                console.log(category.id);
                console.log("**********************");

                if(!hideCategories.includes(category.id)){
                    console.log("hideEvent set to false");
                    hideEvent = false;
                }
            })
        }
        else{
            hideEvent = false;
        }

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

            eventDIV = generateEventDIV(event, hideEvent);

            var eventDateCell = $("#" + eventDateID);

            var formerEventDiv = $("#" + event.id);
            formerEventDiv.remove();
            console.log("appending: " + eventDIV + " to " + eventDateCell);

            eventDateCell.append(eventDIV);

            $("#deleteSpan" + event.id).on("click", function(){

                deleteEventModal.modal({
                    onApprove : function(){
                        $("#" + event.id).remove();
                        deleteEvent(event.id);
                    }

                }).modal("show");

            })



    })

}

function nextYear(){
    currentYear++;
}

function previousYear(){
    currentYear--;
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

    nextYearButton.click(function(){
        nextYear();
        displayYearMonthDate(currentDate, currentMonth, currentYear);
        displayMonthView(currentMonth, currentYear);
        displayEventsMonthView();
    });

    previousYearButton.click(function(){
        previousYear();
        displayYearMonthDate(currentDate, currentMonth, currentYear);
        displayMonthView(currentMonth, currentYear);
        displayEventsMonthView();
    })

    nextMonthOrWeekButton.click(function(){
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

    previousMonthOrWeekButton.click(function(){
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

function generateEventDIV(event, hideEvent){

    var deleteSpan;
    var htmlString;
    if(!hideEvent){

        deleteSpan = '<span id="deleteSpan' + event.id + '"><i class="trash alternate icon"></i></span>';
        htmlString = '<div id="' + event.id + '">';
        // htmlString += '<h3>' + eventDate + '</h3>';
        htmlString += deleteSpan;
        htmlString += '<p>' + event.title + '</p>';

        htmlString += '</div>';
    }


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
    // console.log("displayCategories()")
    // console.log("selectedCategories:" + selectedCategories);

    var categoryItem;
    allCategoriesDisplay.empty();

    allCategories.forEach(function(category){

        categoryItem = generateCategoryItem(category);
        allCategoriesDisplay.append(categoryItem);

        // click listener for selecting and deselecting a category
        $("#" + category.id).bind("click", function(){
            if(hideCategories.includes(category.id)){
                hideCategories = arrayRemove(hideCategories, category.id);
                $("#" + category.id).removeClass("hideCategory");
                if(inMonthView){
                    displayEventsMonthView();
                }
                else{
                    displayEventsWeekView();
                }
            }
            else{
                hideCategories.push(category.id);
                $("#" + category.id).addClass("hideCategory");
                if(inMonthView){
                    displayEventsMonthView();
                }
                else{
                    displayEventsWeekView();
                }
            }
        })
        // click listener for deleting a category

        $("#deleteSpan" + category.id).bind("click", function(){
            deleteCategoryModal.modal({
                onApprove : function(){
                    deleteCategory(category.id);
                }

            }).modal("show");
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
          deleteCategoryFromEvents();
          loadData();
      })

}

function deleteCategoryFromEvents(){
    // to be implemented
}

// HTML creators

function generateCategoryItem(category){




    // <div class="item">
    // <img class="ui avatar image" src="/images/avatar/small/tom.jpg">
    // <div class="content">
    //     <div class="header">Tom</div>
    //     Top Contributor
    // </div>


    var style = 'style="background-color: #2185d0; color: #fff; margin-bottom: 10px"';

    var nameParagraph = '<p style="color: #fff">' + category.name + '</p>';
    var deleteSpan = '<span id="deleteSpan' + category.id + '"><i class="trash alternate icon"></i></span>';

    // var htmlString = '<li ' + style + 'id="' + category.id + '">';
    // htmlString += deleteSpan;
    // htmlString += nameParagraph;
    // htmlString += '</li>';

    var htmlString = '<div ' + style + ' class="item ui button" id="' + category.id + '">';
    htmlString += '<div class="content">'
    + '<div class="flexCategory header">' + deleteSpan + nameParagraph + '</div>';
    // htmlString += deleteSpan;
    htmlString += '</div>';
    // console.log(htmlString);

    return htmlString;
}

// *************************************************************************************************




// *************************************************************************************************
// Entries: Create, Edit and Delete

function deleteEvent(eventID){

    $.ajax({
        type: "DELETE",
        url: "https://dhbw.cheekbyte.de/calendar/500/events/" + eventID,
        success: function(){
            console.log("Successfully deleted event");
        },
      }).done(function(response){
          console.log(response);
          loadData();
      })

}

    // form stuff Leon

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

      startDate.change(function() {
        checkDateValidity();
      })

      endDate.change(function() {
        checkDateValidity();
      })

      alldayInput.change(function() {

        var alldayValue = $('input[name=allday]').is(':checked');
        if(alldayValue) {
          document.getElementById('startTInputField').classList.add("disabled");
          document.getElementById('endTInputField').classList.add("disabled");

          document.getElementById('startTInput').value = "00:00";
          document.getElementById('endTInput').value = "23:59";

          document.getElementById('startTInput').classList.remove("red");
          document.getElementById('endTInput').classList.remove("red");



        } else {
          document.getElementById('startTInputField').classList.remove("disabled");
          document.getElementById('endTInputField').classList.remove("disabled");

        }

      })

      $('#categoryDropdown').mouseenter(function() {

        var categoryInput = $('#categoryDropdown').dropdown('get value');
        categoryInput = categoryInput.split(',');


        if(categoryInput.length > 0) {

          var contained = false;
          var currentInput;

          categoryInput.forEach(function(input) {

            allCategories.forEach(function(category) {
              if(input == category.id) {
                contained = true;
              }
              currentInput = input;

            })

            if(contained == false) {
              $('#categoryDropdown').dropdown('remove selected', currentInput);
            }

            })


        }



        var categoryEntry = [];
        var i = 0;

        allCategories.forEach(function(category) {

          if(i == 0){
            categoryEntry[i] = "{\"value\":\"" + category.id + "\",\"text\":\"" + category.name + "\",\"name\":\"" + category.name + "\"}";
          } else {
            categoryEntry[i] = ",{\"value\":\"" + category.id + "\",\"text\":\"" + category.name + "\",\"name\":\"" + category.name + "\"}";
          }
          i++;

        })

        var categoryBuildString = "{ \"values\": [";

        categoryEntry.forEach(function(categoryentry) {
          categoryBuildString = categoryBuildString + categoryentry;
        })

        categoryBuildString = categoryBuildString + "]}";

        // console.log(categoryBuildString);

        var categoryData = JSON.parse(categoryBuildString);
        $('#categoryDropdown').dropdown('setup menu', categoryData);
        // $('#categoryDropdown').dropdown('refresh');
        // console.log($('#categoryDropdown').dropdown('get value'));
    })

      // remove popup after mouse leaves submit button
      document.getElementById('submitButton').onmouseout = function(event) {
        submitButton.popup('destroy');
      }


      submitButton.click(function() {


        var locationValue = document.getElementById("locationInput").value;
        var websiteValue = document.getElementById("websiteInput").value;
        var alldayValue = $('input[name=allday]').is(':checked');
        var startDate = document.getElementById('startDate').value;
        var endDate = document.getElementById('endDate').value;

            // get and get values of all mandatory fields
            // if not given mark them as incomplete
            var titleValue = getAndCheckTitleInput();
            var organizerValue = checkAndGetOrganizerInput();
            var startTimeValue = getAndCheckStartInput();
            var endTimeValue = getAndCheckEndInput();
            var statusValue = getStatusInput();
            var categoryInput = $('#categoryDropdown').dropdown('get value');
            categoryInput = categoryInput.split(',');
            var categoryString;

            if(categoryInput[0] == "") {
              categoryString = "";

            } else {

              categoryString = ',"categories":[';
              var counter = 0;
              categoryInput.forEach(function(input) {
                if(counter == 0) {
                  categoryString = categoryString + '{"id":' + input + '}';
                } else {
                  categoryString = categoryString + ',{"id":' + input + '}';
                }
                counter ++;
              })
              categoryString = categoryString + ']';

            }



            var inputIsValid = true;

            // check if all data was entered correctly
            if(!titleValue || !organizerValue || !startTimeValue || !endTimeValue || !statusValue) {
              inputIsValid = false;

              submitButton.popup();
              submitButton.popup('show');


            }

            // check if times are valid
            checkTimeValidity();

            // check if dates are valid
            checkDateValidity();

            // check if image is valid
            // checkImageAndGetB64();






            // if all the necessary input is give correctly a request can be made
            if(inputIsValid) {

              // if allday is true set times to ...
              if(alldayValue) {
                startTimeValue = "00:00";
                endTimeValue = "23:59";
              }

              var startTime = startDate + "T" + startTimeValue;
              var endTime = endDate + "T" + endTimeValue;
              console.log(categoryString);
              // make request with data
              var dummyRequest = '{ "title": "' + titleValue + '", "location": "' + locationValue + '", "organizer": "' + organizerValue + '", "start": "' + startTime + '", "end": "' + endTime + '", "status": "' + statusValue + '", "allday": ' + alldayValue + ', "webpage": "' + websiteValue + '"' + categoryString + '}';
              console.log(dummyRequest);


            // var requestData = JSON.parse(dummyRequest);
            var requestData = dummyRequest;
            // console.log(requestData);
            $.post("https://dhbw.cheekbyte.de/calendar/500/events",requestData, function(status) {
              console.log(status);
            });

          }

    })

  }


function refreshFormInput() {

  $('#statusDropdown').dropdown('clear');
  $('#categoryDropdown').dropdown('clear');
  $('#alldayField').checkbox('set unchecked');

  document.getElementById('titleInput').value = "";
  document.getElementById('locationInput').value = "";
  document.getElementById('organizerInput').value = "";
  document.getElementById('websiteInput').value = "";
  document.getElementById('imageInput').value = "";
  document.getElementById('startDate').value = "";
  document.getElementById('endDate').value = "";
  document.getElementById('startTInput').value = "";
  document.getElementById('endTInput').value = "";



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
  var regex = new RegExp(/^\S+@\S+\.\S+$/);

  if (organizerInputValue == "" || !regex.test(organizerInputValue)) {
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
    return false;
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

function checkDateValidity() {
  var startDateValue = document.getElementById('startDate').value;
  var endDateValue = document.getElementById('endDate').value;

  if(startDateValue > endDateValue) {
    document.getElementById('startDate').classList.add("red");
    document.getElementById('endDate').classList.add("red");


  } else {
    document.getElementById('startDate').classList.remove("red");
    document.getElementById('endDate').classList.remove("red");


  }

}

function checkTimeValidity() {
  startTimeValue = getAndCheckStartInput();
  endTimeValue = getAndCheckEndInput();

  if(!startTimeValue || !endTimeValue) {
    return false;
  }

  startInt1 = parseInt(startTimeValue.toString().substring(0,2), 10);
  startInt2 = parseInt(startTimeValue.toString().substring(3,6), 10);

  endInt1 = parseInt(endTimeValue.toString().substring(0,2), 10);
  endInt2 = parseInt(endTimeValue.toString().substring(3,6), 10);
  if(startInt1 > endInt1) {
  } else if(startInt1 == endInt1 && startInt2 > endInt2) {
  } else {
    return true;
  }
  document.getElementById('startTInput').classList.add("red");
  document.getElementById('endTInput').classList.add("red");
  return false;


}




function checkImageAndGetB64() {

  var imagePath = document.getElementById('imageInput');

  // var xhr = new XMLHttpRequest();
  // xhr.withCredentials = true;
  //
  // xhr.addEventListener("readystatechange", function () {
  //   if (this.readyState === 4) {
  //     console.log(this.responseText);
  //   }
  // });
  //
  // xhr.open("GET", "https://image.cnbcfm.com/api/v1/image/105992231-1561667465295gettyimages-521697453.jpeg");
  // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  // xhr.setRequestHeader("Access-Control-Allow-Credentials", "*");
  //
  // xhr.send();






//   $.ajax({
//      url: "file:///Users/leonfeldmann/Desktop/test.jpeg",
//      method: "GET",
//      beforeSend: function (xhr) {
//
//     // xhr.setRequestHeader('Access-Control-Content-Type', '*');
//     xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
//     xhr.setRequestHeader('Access-Control-Allow-Credentials', true);
//     // xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
//
//   },
//      xhrFields: {
//         withCredentials: true
//      }
//   }).done(function( msg ) {
//  console.log( "Data Saved: " + msg );
// });

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://image.cnbcfm.com/api/v1/image/105992231-1561667465295gettyimages-521697453.jpeg",
  "method": "GET",
  "headers": {
    "User-Agent": "PostmanRuntime/7.15.0",
    "Accept": "*/*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Cache-Control": "no-cache",
    "Postman-Token": "24f687cc-a522-44ad-81dc-3d809a84f9d7,2f89013f-acc7-4bdf-8121-1bbc806acdad",
    "cache-control": "no-cache"
  }
}

$.ajax(settings).done(function (response) {
  console.log(response);
});


// // working
  // function toDataURL(imagePath, callback) {
  //   var xhr = new XMLHttpRequest();
  //   xhr.onload = function() {
  //     var reader = new FileReader();
  //     reader.onloadend = function() {
  //       callback(reader.result, xhr.response.size);
  //     }
  //     reader.readAsDataURL(xhr.response);
  //   };
  //   xhr.open('GET', imagePath);
  //   xhr.responseType = 'blob';
  //   xhr.withCredentials = true;
  //   xhr.send();
  //
  // }
  //
  // toDataURL(imagePath, function(dataUrl, size) {
  //
  //   // localStorage.setItem('size', size);
  //   // localStorage.setItem('imageB64', dataUrl);
  //
  // })


  // var size = localStorage.getItem('size');
  // var imageB64 = localStorage.getItem('imageB64');
  // localStorage.clear();
  //
  // if(size > 500000 || size == 0) {
  //   document.getElementById('imageInput').classList.add("red");
  //   return false;
  // } else {
  //   document.getElementById('imageInput').classList.remove("red");
  //   return imageB64;
  // }

}
