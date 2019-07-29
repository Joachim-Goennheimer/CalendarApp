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

sundayDateSpan = $("#sundayDateSpan");
mondayDateSpan = $("#mondayDateSpan");
tuesdayDateSpan = $("#tuesdayDateSpan");
wednesdayDateSpan = $("#wednesdayDateSpan");
thursdayDateSpan = $("#thursdayDateSpan");
fridayDateSpan = $("#fridayDateSpan");
saturdayDateSpan = $("#saturdayDateSpan");
weekViewButton = $("#weekView");

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"];
// boolean that tracks whether program is in month or in week view.
// Necessary for next, previous buttons to work properly
inMonthView = true;

var eventData;

$(document).ready(function(){

    
    displayMonthView(currentMonth, currentYear);
    displayYearMonthDate(currentDate, currentMonth, currentYear);

    loadEventData().then(function(message){

        displayEventsMonthView();
        console.log(message);
        console.log(eventData);
    })
    .catch(function(message){
        console.log(message);
    })

    createNewEntryButton.click(function(){
        console.log("toggling sidebar");
        $('.ui.sidebar').sidebar('toggle');
    });

    nextButton.click(function(){
        if(inMonthView){
            nextMonth();
        }
        else{
            nextWeek();
        }
    });

    previousButton.click(function(){
        if(inMonthView){
            previousMonth();
        }
        else{
            previousWeek();
        }
    });

    weekViewButton.click(function(){
        if(inMonthView){
            inMonthView = false;
            displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
            weekViewButton.text("Month View");
        }
        else{
            inMonthView = true;
            displayMonthView(currentMonth, currentYear)
            weekViewButton.text("Week View");

        }
    })
})

function loadEventData(){

    return new Promise(function(resolve, reject){

        $.get("https://dhbw.cheekbyte.de/calendar/500/events", function(data){
        eventData = data;
        resolve("success");
        reject("loading error");
        })
    });

}


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

    var currentYearString = "" + currentYear;
    var currentMonthString = "" + currentMonth;
    var currentDayString = "" + currentDate;

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

        if(eventYear === currentYear && eventMonth === currentMonth){

            console.log(event.title);
            eventDateID = calculateIDMonthView(eventYear, eventMonth, eventDate);
            eventDIV = generateEventDIV(event);
            console.log("eventDateID: " + eventDateID);
            var eventDateCell = $("#" + eventDateID);
            eventDateCell.append(eventDIV);
        }

        // console.log("*******************************");
        // console.log(event.title);
        // console.log("event year" + eventYear)
        // console.log("event month" + eventMonth)
        // console.log("event day" + eventDate)
        // console.log(event.start);
        // console.log(event.end);

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
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayMonthView(currentMonth, currentYear);
    displayEventsMonthView();
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
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
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
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
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
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayMonthView(currentMonth, currentYear);
    displayEventsMonthView();
}


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

            var columnID = calculateIDWeekView(j, day, date, hoursString, minutesString);
            // console.log("dateID: " + columnID);
            var column = "<td>" + columnID;


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

function calculateIDWeekView(dayToCalculate, day, date, hour, minutes){

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

function hideDateSpans(){
    sundayDateSpan.text("");
    mondayDateSpan.text("");
    tuesdayDateSpan.text("");
    wednesdayDateSpan.text("");
    thursdayDateSpan.text("");
    fridayDateSpan.text("");
    saturdayDateSpan.text("");
}

function generateEventDIV(event){
    var eventID = event.id;
    var eventTitle = event.title;
    var eventStatus = event.status;

    var htmlString = '<div id="' + event.id + '"';
    htmlString += '<h3>' + eventTitle + '</h3>';

    htmlString += '</div>';

    return htmlString;

}
