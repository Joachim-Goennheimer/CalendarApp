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
var listAllEvents = $("#listAllEvents");


// input Form listeners
var startTimeInput = $("#startTInput");
var startDate = $('#startDate');
var endTimeInput = $("#endTInput");
var endDate = $('#endDate');
var titleInput = $("#titleInput");
var locationInput = $('#locationInput');
var organizerInput = $('#organizerInput');
var websiteInput = $('#websiteInput');
var statusInput = $('#statusDropdown');
var categoryInput = $('#categoryInput');
var extraInput = $('#extraInput');
var imageInput = $("#imageInput");
var imageDeleteButton = $("#imageDeleteButton");
var alldayInput = $("#alldayInput");
var submitButton = $("#submitButton");
$('#statusDropdown').dropdown();
$('#categoryDropdown').dropdown();


// category Form listeners
var categoryPostForm = $("#categoryPostForm");
var categoryPostButton = $("#categoryPostButton");
var categoryNameInput = $("#categoryNameInput");
var deleteCategoryModal = $("#deleteCategoryModal");
var confirmDeleteCategoryButton = $("#confirmDeleteCategoryButton");

// list all events modal
var listEventsStartTime = $("#listEventsStartTime");
var listEventsEndTime = $("#listEventsEndTime");
var listEventsTitle = $("#listEventsTitle");
var listEventsLocation = $("#listEventsLocation");
var listEventsDetails = $("#listEventsDetails");

// display selected event modal listeners
var displaySelectedEventModal = $("#displaySelectedEventModal");
var displaySelectedEventTitle = $("#displaySelectedEventTitle");
var displaySelectedEventStartTime = $("#displaySelectedEventStartTime");
var displaySelectedEventEndTime = $("#displaySelectedEventEndTime");
var displaySelectedEventLocation = $("#displaySelectedEventLocation");
var displaySelectedEventOrganizer = $("#displaySelectedEventOrganizer");
var displaySelectedEventWebsite = $("#displaySelectedEventWebsite");
var displaySelectedEventStatus = $("#displaySelectedEventStatus");
var displaySelectedEventCategories = $("#displaySelectedEventCategories");
var displaySelectedEventNotes = $("#displaySelectedEventNotes");
var displaySelectedEventImage = $("#displaySelectedEventImage");

// delete event modal
var deleteEventModal = $("#deleteEventModal");
var confirmDeleteEventButton = $("#confirmDeleteEventButton");


var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"];
var allCategories = [];
var hideCategories = [];

// boolean that tracks whether program is in month or in week view.
// Necessary for next, previous buttons to work properly.
var inMonthView = true;

// boolean that tracks whether program is in edit mode or not.
// Necessary for post form to decide whether post or put request should be send.
var editMode = false;
var editID;

// holds the data of all events.
var eventData;

$(document).ready(function(){


    displayMonthView(currentMonth, currentYear);
    displayYearMonthDate(currentDate, currentMonth, currentYear);

    loadData();

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
            if(inMonthView){
                displayEventsMonthView();
            }
            else{
                displayEventsWeekView();
            }
        })


    }).catch(function(message){
        console.log(message);
    })

}


function loadEventData(){

    return new Promise(function(resolve, reject){

        $.get("https://dhbw.cheekbyte.de/calendar/50034054/events", function(data){
        eventData = data;
        resolve("success");
        reject("loading error");
        })
    });

}

function loadCategoryData(){

    return new Promise(function(resolve, reject){

        $.get("https://dhbw.cheekbyte.de/calendar/50034054/categories", function(data){
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

// function that loads the table for the month view. This layout will automatically be displayed when the page loads or when the
// user clicks on the month view button.
function displayMonthView(month, year){

    var tableContent = "";
    var daysInMonth = calculateDaysInMonth(month, year);
    var currentDateID;
    var startDay = (new Date(year, month)).getDay();
    var columnIDs = [];

    timeHeader.hide();
    hideDateSpans();

    calendarBody.empty();
    
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
                column = "<td id='" + columnID + "' class='dayCellMonthView'>";
                column = column + "<h1 class='createNewEventsArea' id='createNew" + columnID + "'>" + dateCounter + "</h1>";
                columnIDs.push(columnID);
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

    // markes current date
    currentDateID = calculateIDMonthView(currentYear, currentMonth, currentDate);

    $("#" + currentDateID).addClass("currentDateStyle");
    addClickListenersMonthView(columnIDs, year, month);
}

// function that loads all the events in the month that is currently displayed to the user. This method will always be called when
// the user switches the month, starts month view, reloads the page, or adds a new event or category.
function displayEventsMonthView(){

    var eventStartString;
    var eventEndString

    var eventStartYear;
    var eventEndYear;
    var eventStartMonth;
    var eventEndMonth;
    var eventStartDate;
    var eventEndDate;

    var eventDateIDS;
    var eventDIV;

    var hideEvent;

    eventData.forEach(function(event){

        hideEvent = true;

        // checks whether the user has switched off all the categories that are attributed to the event. In that case the event
        // will not be displayed to the user.
        if(event.categories.length > 0){
            event.categories.forEach(function(category){

                if(!hideCategories.includes(category.id)){
                    hideEvent = false;
                }
            })
        }
        else{
            hideEvent = false;
        }

        eventStartString = event.start;
        eventEndString = event.end;

        eventStartYear = eventStartString.slice(0, 4);
        eventEndYear = eventEndString.slice(0, 4);
        eventStartMonth = eventStartString.slice(5, 7);
        eventEndMonth = eventEndString.slice(5, 7);

        // because currentMonth is only one digit if below 10
        if(eventStartMonth.slice(0, 1) === "0"){
            eventStartMonth = "" + eventStartMonth.slice(1);
        }
        if(eventEndMonth.slice(0,1) === "0"){
            eventEndMonth = "" + eventEndMonth.slice(1);
        }

        eventStartDate = eventStartString.slice(8, 10);
        eventEndDate = eventEndString.slice(8, 10);

        eventStartYear = parseInt(eventStartYear);
        eventEndYear = parseInt(eventEndYear);
        eventStartMonth = parseInt(eventStartMonth) -1;
        eventEndMonth = parseInt(eventEndMonth) -1;
        eventStartDate = parseInt(eventStartDate);
        eventEndDate = parseInt(eventEndDate);

        // cell cleared first because event might already be displayed
        var formerEventDiv = $("." + event.id);
        formerEventDiv.remove();

        eventDateIDS = calculateIDSMonthView(eventStartYear, eventEndYear, eventStartMonth, eventEndMonth, eventStartDate, eventEndDate);

        eventDateIDS.forEach(function(eventDateID){

                eventDIV = generateEventDIV(event, hideEvent);
                var eventDateCell = $("#" + eventDateID);

                eventDateCell.append(eventDIV);
                $(".deleteSpan" + event.id).on("click", function(){
    
                    deleteEventModal.modal({
                        onApprove : function(){
                            $("." + event.id).remove();
                            deleteEvent(event.id);
                        }
    
                    }).modal("show");
    
                })
                $(".displaySelectedEvent" + event.id).on("click", function(){
                    displaySelectedEventView(event)
                })    

        })

        
    })

}

// adds the listener to the cells for creating a new event at the corresponding date.
function addClickListenersMonthView(columnIDs){

    columnIDs.forEach(function(columnID){

        $("#createNew" + columnID).on("click", function(){
            editMode = false;
            editID = "";

            var inputString = columnID;
            var regEx1 = /-(\d)-/;
            var result = inputString.replace(regEx1, "-0$1-");
            var regEx2 = /-(\d)$/;
            result = result.replace(regEx2, "-0$1");

            // have to do months +1 because calendar internally counts from 0 to 11.
            // not very nice but in interest of time a quick fix that works.
            var month = parseInt(result.substring(5,7));
            month ++;
            if(month <10){
                month = "0" + month;
            }

            result = result.substring(0, 5) + month + result.substring(7);

            $('.ui.sidebar').sidebar('toggle');
            refreshFormInput();
            startDate.val(result);
            endDate.val(result);

        })
    })
}

// function that loads the table for the week view. This layout will automatically be displayed when the user clicks on the week view
// button.
function displayWeekView(minutes, hour, day, date, month, year){

    inMonthView = false;

    var timeTracker = new Date();
    var tableContent = "";
    var nightStyleClass = "";
    var columnIDs = [];

    timeTracker.setHours(07);
    timeTracker.setMinutes(00);

    timeHeader.show();
    calendarBody.empty();

    displayDateSpans(day, date);

    for(i = 0; i < 48; i++){

        hours = timeTracker.getHours();
        minutes = timeTracker.getMinutes();
        if(hours < 10){
            if(hours <7){
                nightStyleClass = "nightStyle";
            }
            else{
                nightStyleClass = "";
            }
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
            var column = "<td class='" + nightStyleClass + "' id='" + columnID + "'>";
            column += "<h1 class='createNewEventsArea' id='createNewEventsArea" + columnID + "'></h1>"
            column = column + "</td>";

            columnIDs.push(columnID);

            row = row + column;

        }

        row = row + "</tr>";
        tableContent = tableContent + row;
    }

    calendarBody.append(tableContent);
    addClickListenersWeekView(columnIDs);

}

// function that loads all the events in the week that is currently displayed to the user. This method will always be called when
// the user switches the week, starts week view, reloads the page, or adds a new event or category.
function displayEventsWeekView(){

    var eventStartString;
    var eventStartYear;
    var eventStartMonth;
    var eventStartDate;
    var eventEndDate;
    var eventStartHour;
    var eventEndHour;
    var eventStartMinutes;
    var eventEndMinutes;

    var eventDateIDS;
    var eventDIV;

    var hideEvent;

    eventData.forEach(function(event){

        hideEvent = true;
        
        // checks whether the user has switched off all the categories that are attributed to the event. In that case the event
        // will not be displayed to the user.
        if(event.categories.length > 0){
            event.categories.forEach(function(category){

                if(!hideCategories.includes(category.id)){
                    hideEvent = false;
                }
            })
        }
        else{
            hideEvent = false;
        }

        eventStartString = event.start;
        eventEndString = event.end;

        eventStartYear = eventStartString.slice(0, 4);
        eventStartMonth = eventStartString.slice(5, 7);
        eventStartDate = eventStartString.slice(8, 10);
        eventEndDate = eventEndString.slice(8, 10);
        eventStartHour = eventStartString.slice(11, 13);
        eventEndHour = eventEndString.slice(11, 13);
        eventStartMinutes = eventStartString.slice(14, 17);
        eventEndMinutes = eventEndString.slice(14, 17);

        // because currentMonth is only one digit if below 10
        if(eventStartMonth.slice(0, 1) === "0"){
            eventStartMonth = "" + eventStartMonth.slice(1);
        }


        eventStartYear = parseInt(eventStartYear);
        eventStartMonth = parseInt(eventStartMonth) -1;
        eventStartDate = parseInt(eventStartDate);
        eventEndDate = parseInt(eventEndDate);
        eventStartHour = parseInt(eventStartHour);
        eventEndHour = parseInt(eventEndHour);
        eventStartMinutes = parseInt(eventStartMinutes);
        eventEndMinutes = parseInt(eventEndMinutes);

        var formerEventDiv = $("." + event.id);
        formerEventDiv.remove();

        eventDateIDS = calculateIDSWeekView(eventStartYear, eventStartMonth, eventStartDate, eventEndDate, eventStartHour, eventEndHour, eventStartMinutes, eventEndMinutes);

        eventDateIDS.forEach(function(eventDateID){

            eventDIV = generateEventDIV(event, hideEvent);

            var eventDateCell = $("#" + eventDateID);

            eventDateCell.append(eventDIV);

            $(".deleteSpan" + event.id).on("click", function(){

                deleteEventModal.modal({
                    onApprove : function(){
                        $("." + event.id).remove();
                        deleteEvent(event.id);
                    }

                }).modal("show");

            })
            $(".displaySelectedEvent" + event.id).on("click", function(){
                displaySelectedEventView(event);
            })


        })
            

    })

}

// adds the listener to the cells for creating a new event at the corresponding date.
function addClickListenersWeekView(columnIDs){

    var date;
    var time;
    var splitIndex;
    columnIDs.forEach(function(columnID){

        $("#createNewEventsArea" + columnID).on("click", function(){

            splitIndex = columnID.indexOf("T");
            date = columnID.substring(0, splitIndex);
            time = columnID.substring(splitIndex+1);
            time = time.substring(0, 2) + ":" + time.substring(2, 4);

            var inputString = date;
            var regEx1 = /-(\d)-/;
            var result = inputString.replace(regEx1, "-0$1-");
            var regEx2 = /-(\d)$/;
            result = result.replace(regEx2, "-0$1");

            // have to do months +1 because calendar internally counts from 0 to 11.
            // not very nice but in interest of time a quick fix that works.
            var month = parseInt(result.substring(5,7));
            month ++;
            if(month <10){
                month = "0" + month;
            }

            result = result.substring(0, 5) + month + result.substring(7);

            $('.ui.sidebar').sidebar('toggle');
            refreshFormInput();

            startDate.val(result);
            endDate.val(result);
            startTimeInput.val(time);
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

    // if the last saturday has a higher date than possible the lastDateOfWeek is not on a saturday which means that the month ends prior in the week
    if(lastDateOfWeek > daysInMonth){
        lastDateOfWeek = daysInMonth;
    }
    // calculates the days that are left in the month
    var daysLeftInMonth = daysInMonth - currentDate;
    if(currentMonth === 11){
        currentYear++;
        currentMonth = 0;
        currentDate = 7 - (daysLeftInMonth % 7);
    }
    else{
        currentMonth++;
        // calculates the new current date displayed. It will always be the same day of the week as in the month before.
        currentDate = 7 - (daysLeftInMonth % 7);
    }
}

function previousMonth(){
    daysInPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear)
    if(currentMonth === 0){
        currentYear--;
        currentMonth = 11;
    }
    else{
        currentMonth--;
    }
    currentDate = daysInPrevMonth - ( 7 - (currentDate % 7) );

}

function nextWeek(){

    var daysInMonth = calculateDaysInMonth(currentMonth, currentYear);
    var lastDateOfWeek = currentDate - currentDay + 6;
    if(lastDateOfWeek > daysInMonth){
        lastDateOfWeek = daysInMonth;
    }

    var daysLeftInMonth = daysInMonth - currentDate;

    if(daysLeftInMonth < 7){
        if(currentMonth === 11){
            currentYear++;
            currentMonth = 0;
        }
        else{
            currentMonth++;
        }
        currentDate = 7 - daysLeftInMonth;
    }
    else{
        currentDate += 7;
    }

}

function previousWeek(){
    var daysInPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear)
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

function displayDateSpans(day, date){

    var daysinPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear);
    var daysInCurrentMonth = calculateDaysInMonth(currentMonth, currentYear);
    var weekDates = [];

    var dateNamingCounter = date-day;
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

// calculates and returns the IDs of cells in month view. Used to map the events to the correct cells.
function calculateIDMonthView(year, month, date){

    return "" + year + "-" + month + "-" + date;
}

// calculates all the cell-IDs to which a particular event needs to be mapped. As an event can go over several days it is possible
// that more than one cell has to display the event. Does not yet take into account when an event goes over several months or years.
function calculateIDSMonthView(startYear, endYear, startMonth, endMonth, startDate, endDate){

    var eventIDS = [];
    var daysInStartMonth = calculateDaysInMonth(startMonth, startYear);

    while(startYear <= endYear){

        while((startMonth <= endMonth || startYear < endYear) && startMonth <= 11){

            while((startDate <= endDate || startMonth < endMonth || startYear < endYear) && startDate <= daysInStartMonth){
                eventIDS.push(calculateIDMonthView(startYear, startMonth, startDate));
                startDate++
            }
            startDate = 1;
            startMonth++;
            // needs to be updated for every month
            daysInStartMonth = calculateDaysInMonth(startMonth, startYear);
        }
        startMonth = 0;
        startYear++;
        daysInStartMonth = calculateDaysInMonth(startMonth, startYear);
    }

    return eventIDS;
}

// function that sets the ids in the current week View displayed to the user
function setIDWeekView(dayToCalculate, day, date, hour, minutes){

    var daysinPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear);
    var daysInCurrentMonth = calculateDaysInMonth(currentMonth, currentYear);
    var weekDates = [];

    var dateNamingCounter = date-day;
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

// calculates and returns the IDs of cells in week view. Used to map the events to the correct cells.
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

// calculates all the cell-IDs to which a particular event needs to be mapped. As an event can go over several hours it is possible
// that more than one cell has to display the event. Does not yet take into account when an event goes over several months or years.
function calculateIDSWeekView(year, month, startDate, endDate, startHour, endHour, startMinutes, endMinutes){

    var eventIDS = [];

    while(startDate <= endDate){

        while((startHour <= endHour || startDate < endDate) && startHour <= 23){

            while((startMinutes < endMinutes || startHour < endHour || startDate < endDate) && startMinutes <= 59){
                eventIDS.push(calculateIDWeekView(year, month, startDate, startHour, startMinutes));
                startMinutes += 30;
            }
            startMinutes = 0;
            startHour++;
        }
        startHour = 0;
        startDate++;
    }

    return eventIDS;
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

    createNewEntryButton.click(function(){
        $('.ui.sidebar').sidebar('toggle');

        refreshFormInput();

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

    listAllEvents.click(function(){

        var startDate;
        var startMonth;
        var startYear;
        var startHour;
        var startMinutes;

        var endDate;
        var endMonth;
        var endYear;
        var endHour;
        var endMinutes;

        var eventStartString;
        var timeStartString
        var eventEndString;
        var categorySpan;

        listEventsStartTime.empty();
        listEventsEndTime.empty();
        listEventsTitle.empty();
        listEventsLocation.empty();
        listEventsDetails.empty();

        eventData.forEach(function(event){
            
            listEventsTitle.append("<p>" + event.title + "</p>");

            startDate = event.start.substring(8, 10);
            startMonth = event.start.substring(5, 7);
            startYear = event.start.substring(0, 4);

            startHour = event.start.substring(11, 13);
            startMinutes = event.start.substring(14);
            timeStartString = "<span class='displaySelectedEventTimeSpan'>" + startHour + ":" + startMinutes + "</span>";

            eventStartString = startDate + "." + startMonth + "." + startYear;

            endDate = event.end.substring(8, 10);
            endMonth = event.end.substring(5, 7);
            endYear = event.end.substring(0, 4);

            endHour = event.end.substring(11, 13);
            endMinutes = event.end.substring(14);
            timeEndString = "<span class='displaySelectedEventTimeSpan'>" + endHour + ":" + endMinutes + "</span>";

            eventEndString = endDate + "." + endMonth + "." + endYear;

            listEventsStartTime.append("<p>" + eventStartString + "</p>");
            listEventsEndTime.append("<p>" + eventEndString + "</p>");
            listEventsLocation.append("<p>" + event.location + "</p>");
            listEventsDetails.append("<p id='displayDetails" + event.id + "'>Show Details</p>")
            
            $("#displayDetails" + event.id).on("click", function(){
                displaySelectedEventView(event);
            })

        })

        $('#listAllEventsModal').modal({
            inverted: false
        })
        .modal('show');

    })
}

function generateEventDIV(event, hideEvent){

    var deleteSpan;
    var htmlString;
    if(!hideEvent){

        deleteSpan = '<span class="deleteSpan' + event.id + '"><i class="trash alternate icon"></i></span>';
        htmlString = '<div class="' + event.id + '">';
        // htmlString += '<h3>' + eventDate + '</h3>';
        htmlString += deleteSpan;
        htmlString += '<p class="displaySelectedEvent' + event.id + '">' + event.title + '</p>';

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
            url: "https://dhbw.cheekbyte.de/calendar/50034054/categories",
            data: formData,
            success: function(){
                // console.log("Successfully posted category");
            },
            dataType: "json",
            contentType : "application/json"
          }).done(function(response){
              allCategories = [];
              loadData();

          })

    })
}

function deleteCategory(categoryID){

    Promise.all(deleteCategoryFromEvents(categoryID)).then(function(){

        $.ajax({
            type: "DELETE",
            url: "https://dhbw.cheekbyte.de/calendar/50034054/categories/" + categoryID,
            success: function(){
                // console.log("Successfully deleted category");
            },
          }).done(function(response){
              loadData();
          })
      });



}

// deletes a category from all events that are attributed to the category.
function deleteCategoryFromEvents(categoryID){

    var promises = [];

    eventData.forEach(function(event){
        if(eventContainsCategory(event, categoryID)){
            promises.push(
                $.ajax({
                    type: "DELETE",
                    url: "https://dhbw.cheekbyte.de/calendar/50034054/categories/" + categoryID + "/" + event.id,
                    success: function(){
                        // console.log("Successfully deleted category from event: " + event.title);
                    },
                })
            );
        }
        else{
            // console.log("Category not contained in event: " + event.title);
        }

    })

    return promises
}

// checks whether an event can be attributed to a category with a certain categoryID.
function eventContainsCategory(event, categoryID){

    var containsCategory = false;

    event.categories.forEach(function(category){
        if(category.id === categoryID){
            containsCategory = true;
        }
    })

    return containsCategory;
}

// HTML creators

function generateCategoryItem(category){

    var style = 'style="background-color: #2185d0; color: #fff; margin-bottom: 10px"';

    var nameParagraph = '<p style="color: #fff">' + category.name + '</p>';
    var deleteSpan = '<span id="deleteSpan' + category.id + '"><i class="trash alternate icon"></i></span>';

    var htmlString = '<div ' + style + ' class="item ui button reducedMargin" id="' + category.id + '">';
    htmlString += '<div class="content">'
    + '<div class="flexCategory header">' + deleteSpan + nameParagraph + '</div>';
    htmlString += '</div>';

    return htmlString;
}

// *************************************************************************************************




// *************************************************************************************************
// Entries: Display, Create, Edit and Delete

// displays all the details of an event when the user clicks on it.
function displaySelectedEventView(event){

    var startDate;
    var startMonth;
    var startYear;
    var startHour;
    var startMinutes;

    var endDate;
    var endMonth;
    var endYear;
    var endHour;
    var endMinutes;

    var eventStartString;
    var timeStartString
    var eventEndString;
    var categorySpan;

    displaySelectedEventTitle.empty();
    displaySelectedEventStartTime.empty();
    displaySelectedEventEndTime.empty();
    displaySelectedEventLocation.empty();
    displaySelectedEventOrganizer.empty();
    displaySelectedEventWebsite.empty();
    displaySelectedEventStatus.empty();
    displaySelectedEventCategories.empty();
    displaySelectedEventNotes.empty();

    displaySelectedEventTitle.append(event.title);

    startDate = event.start.substring(8, 10);
    startMonth = event.start.substring(5, 7);
    startYear = event.start.substring(0, 4);

    startHour = event.start.substring(11, 13);
    startMinutes = event.start.substring(14);
    timeStartString = "<span class='displaySelectedEventTimeSpan'>" + startHour + ":" + startMinutes + "</span>";

    eventStartString = startDate + "." + startMonth + "." + startYear + timeStartString;

    endDate = event.end.substring(8, 10);
    endMonth = event.end.substring(5, 7);
    endYear = event.end.substring(0, 4);

    endHour = event.end.substring(11, 13);
    endMinutes = event.end.substring(14);
    timeEndString = "<span class='displaySelectedEventTimeSpan'>" + endHour + ":" + endMinutes + "</span>";

    eventEndString = endDate + "." + endMonth + "." + endYear + timeEndString;

    displaySelectedEventStartTime.append(eventStartString);
    displaySelectedEventEndTime.append(eventEndString);
    displaySelectedEventLocation.append(event.location);
    displaySelectedEventOrganizer.append(event.organizer);
    displaySelectedEventWebsite.append(event.webpage);
    displaySelectedEventStatus.append(event.status);
    event.categories.forEach(function(category){
        categorySpan = "<span class='displaySelectedEventCategorySpan'>" + category.name + "</span>";
        displaySelectedEventCategories.append(categorySpan);

    })
    displaySelectedEventNotes.append(event.extra);
    displaySelectedEventImage.attr("src", event.imageurl);

    $('#displaySelectedEventModal')
    .modal({
        onApprove: function(){
            editEvent(event);
        },
        inverted: true
    })
    .modal('show');

}

// opens the post form with all the fields already filled in for the particular event. When the Submit button is pressed the event
// will be updated accordingly.
function editEvent(event){

    editMode = true;
    editID = event.id;

    $('.ui.sidebar').sidebar('toggle');
    refreshFormInput();

    startDate.val(event.start.substring(0, 10));
    endDate.val(event.end.substring(0, 10));
    startTimeInput.val(event.start.substring(11))
    endTimeInput.val(event.end.substring(11))
    titleInput.val(event.title);
    organizerInput.val(event.organizer);
    locationInput.val(event.location);
    websiteInput.val(event.webpage);
    statusInput.dropdown('set selected', event.status);
    extraInput.val(event.extra);

    if(event.imageurl != null) {
          // document.getElementById('previewImage').classList.remove('hideImage');
          document.getElementById('previewImage').classList.remove("hidden");

          $('#previewImage').attr('src', event.imageurl);
    }


    if(event.categories.length > 0) {

      event.categories.forEach(function(category) {

        $('#categoryDropdown').dropdown('set selected', category.id);
      })
    }



    if(event.allday){
        alldayInput.prop("checked", true);
    }
    else{
        alldayInput.prop("checked", false);
    }

}

// permanently delets an event.
function deleteEvent(eventID){

    $.ajax({
        type: "DELETE",
        url: "https://dhbw.cheekbyte.de/calendar/50034054/events/" + eventID,
        success: function(){
            // console.log("Successfully deleted event");
        },
      }).done(function(response){
          loadData();
      })

}

    // form stuff

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

      imageInput.change(function() {

        // check if file is valid
        if(document.getElementById('imageInput').files.length > 0 && document.getElementById('imageInput').files[0].size < 500000) {

          // check if wrong file was given previously
          if(document.getElementById('imageSegment').className == "ui segment red") {
              $('#imageInputField').popup('destroy');
          }


          var reader = new FileReader();
          reader.onload = function(e) {
            $('#previewImage').attr('src', e.target.result);
          }

          reader.readAsDataURL(document.getElementById('imageInput').files[0]);
          document.getElementById('previewImage').classList.remove("hidden");
          document.getElementById('imageInput').classList.remove("REMOVE");
          document.getElementById('imageSegment').classList.remove("red");


        } else {
          document.getElementById('imageSegment').classList.add("red");
          $('#imageInputField').popup();
          $('#imageInputField').popup('show');
        }


      })

      imageDeleteButton.click(function() {

         if(document.getElementById('imageSegment').className == "ui segment red") {

          $('#imageInputField').popup('destroy');
        }

        document.getElementById('imageSegment').classList.remove("red");
        document.getElementById('imageInput').classList.add("REMOVE");
        document.getElementById('previewImage').classList.add("hidden");
        $('#previewImage').attr('src', "");

      })

      // create dropdown dynamically based one existing categories
      $('#categoryDropdown').mouseenter(function() {

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

        var categoryData = JSON.parse(categoryBuildString);
        $('#categoryDropdown').dropdown('setup menu', categoryData);
    })

      // remove popup after mouse leaves submit button
      document.getElementById('submitButton').onmouseout = function(event) {
        submitButton.popup('destroy');
      }

      // check all mandatory fields and add visual feedback is necessary
      // then add formating and make add/put request
      submitButton.click(async function() {


        var startDate = document.getElementById('startDate').value;
        var endDate = document.getElementById('endDate').value;
        var locationValue = document.getElementById("locationInput").value;
        var websiteValue = document.getElementById("websiteInput").value;
        var extraInput = document.getElementById('extraInput').value;
        var alldayValue = $('input[name=allday]').is(':checked');


        // get and check values of all mandatory fields
        // if not given mark them as incomplete
        var titleValue = getAndCheckTitleInput();
        var organizerValue = checkAndGetOrganizerInput();
        var startTimeValue = getAndCheckStartInput();
        var endTimeValue = getAndCheckEndInput();
        var statusValue = getStatusInput();
        var categoryInput = $('#categoryDropdown').dropdown('get value');

        categoryInput = categoryInput.split(',');
        var categoryString;
        var extraString = "";
        var inputIsValid = true;

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

        // if extra input was given create extra string
        if(extraInput != "") {

          extraString = ',"extra": "' + extraInput + '"';
        }


        // check if all required data was entered correctly
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
        var imageString = "";
        if(document.getElementById('imageInput').files.length > 0 && document.getElementById('imageInput').files[0].size < 500000) {
          var imageB64 = await convertImageToB64(document.getElementById('imageInput').files[0]);
          // if result is valid add image string
          if(imageB64 != null) {

            imageString = ',"imagedata": "' + imageB64 + '"';
          }
        }

        // if all the necessary input is give correctly a request can be made
        if(inputIsValid) {

          // if image is to be removed set imagedata to REMOVE
          if(document.getElementById('imageInput').className == "REMOVE") {

            imageString = ',"imagedata": "REMOVE"';
          }

          // if allday is true set times to ...
          if(alldayValue) {

            startTimeValue = "00:00";
            endTimeValue = "23:59";

          }

          // concatenate and format dates
          var startTime = startDate + "T" + startTimeValue;
          var endTime = endDate + "T" + endTimeValue;

          // ************************ remove before sending ************************************
          // make request with data
          var requestData = '{ "title": "' + titleValue + '", "location": "' + locationValue + '", "organizer": "' + organizerValue + '", "start": "' + startTime + '", "end": "' + endTime + '", "status": "' + statusValue + '", "allday": ' + alldayValue + ', "webpage": "' + websiteValue + '"' + imageString + categoryString + extraString + '}';

          if(!editMode){

            $.post("https://dhbw.cheekbyte.de/calendar/50034054/events",requestData, function(status) {
            //   console.log(status);
              loadData();
            });
          }
          else{

            $.ajax({
              url: 'https://dhbw.cheekbyte.de/calendar/50034054/events/' + editID,
              type: 'PUT',
              data: requestData,
              dataType: "json",
              contentType: 'application/json',
              success: function(result) {
                // console.log("Edit event: " + editID);
                editID = "";
                loadData();
              }
            });
          }
          $(".ui.sidebar").sidebar("toggle");
        }

      })

    }

  // clears form input
  function refreshFormInput() {

    $('#statusDropdown').dropdown('clear');
    $('#categoryDropdown').dropdown('clear');
    $('#alldayField').checkbox('set unchecked');
    $('#imageCheckbox').checkbox('set unchecked');
    $('#previewImage').attr('src', "");

    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    document.getElementById('startTInput').value = "";
    document.getElementById('endTInput').value = "";
    document.getElementById('titleInput').value = "";
    document.getElementById('locationInput').value = "";
    document.getElementById('organizerInput').value = "";
    document.getElementById('websiteInput').value = "";
    document.getElementById('extraInput').value = "";
    document.getElementById('imageInput').value = "";
    document.getElementById('previewImage').classList.add("hidden");
    document.getElementById('imageSegment').classList.remove("red");
    document.getElementById('statusDropdown').classList.remove("red");
    document.getElementById('organizerInput').classList.remove("red");
    document.getElementById('titleInput').classList.remove("red");
    document.getElementById('startTInput').classList.remove("red");
    document.getElementById('endTInput').classList.remove("red");
    document.getElementById('imageInput').classList.remove("REMOVE");


  }

  // check and/or get  current input data
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

  // try to convert file to base 64, on failure return/reject with null
  function convertImageToB64(file) {

    return new Promise(resolve => {

    var reader = new FileReader();
    reader.onabort = function() {

      reject(null);
    }
    reader.onloadend = function() {

      resolve(reader.result);
    }
    reader.readAsDataURL(file);

  })
}
