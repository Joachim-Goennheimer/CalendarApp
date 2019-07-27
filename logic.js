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

$(document).ready(function(){

    
    displayMonthView(currentMonth, currentYear);
    displayYearMonthDate(currentDate, currentMonth, currentYear);

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

            column = "<td>";

            // empty cell
            if(i === 0 && j < startDay){
                column = column + "Not a day";

            }
            // normal entries
            else if(dateCounter <= daysInMonth){
                column = column + "<h1>" + dateCounter + "</h1>";
                dateCounter++;
            }

            column = column + "</td>";
            row = row + column;
        }


        row = row + "</tr>";
        tableContent = tableContent + row;
    }

    calendarBody.append(tableContent);

}

function nextMonth(){
    var daysInMonth = calculateDaysInMonth(currentMonth, currentYear);
    var lastDateOfWeek = currentDate - currentDay + 6;
    var daysLeftInMonth = daysInMonth - lastDateOfWeek;
    if(currentMonth === 11){
        currentYear++;
        currentMonth = 0;
        currentDate = 7 - daysLeftInMonth;
        console.log("currentDate: " + currentDate);
    }
    else{
        currentMonth++;
        currentDate = 7 - (daysLeftInMonth % 7);
        console.log("currentDate: " + currentDate);
    }
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayMonthView(currentMonth, currentYear);
}

function nextWeek(){
    
    var daysInMonth = calculateDaysInMonth(currentMonth, currentYear);
    var lastDateOfWeek = currentDate - currentDay + 6;
    var daysLeftInMonth = daysInMonth - lastDateOfWeek;
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
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
}

function previousWeek(){
    daysInPrevMonth = calculateDaysPrevMonth(currentMonth, currentYear)
    var daysInPrevMonth;
    if(currentDate < 7){
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
    if(currentMonth === 0){
        currentYear--;
        currentMonth = 11;
    }
    else{
        currentMonth--;
    }
    currentDate = daysInPrevMonth - ( 7 - (currentDate % 7) );
    displayYearMonthDate(currentDate, currentMonth, currentYear);
    displayMonthView(currentMonth, currentYear);
}


function calculateDaysInMonth(month, year){

    return 32 - new Date(year, month, 32).getDate();
}

function calculateDaysPrevMonth(month, year){

    if(currentMonth === 1){
        return calculateDaysInMonth(11, year-1);
    }
    else{
        return calculateDaysInMonth(month, year);
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
            var column = "<td>";


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
    // console.log(date-day);
    var weekDates = [];

    lastMonthDateCounter = date-day;
    while(lastMonthDateCounter < 1){
        weekDates.push(daysinPrevMonth + lastMonthDateCounter);
        lastMonthDateCounter++;
    }
    while(weekDates.length < 7){
        weekDates.push(lastMonthDateCounter);
        lastMonthDateCounter++;
    }

    sundayDateSpan.text(weekDates[0]);
    mondayDateSpan.text(weekDates[1]);
    tuesdayDateSpan.text(weekDates[2]);
    wednesdayDateSpan.text(weekDates[3]);
    thursdayDateSpan.text(weekDates[4]);
    fridayDateSpan.text(weekDates[5]);
    saturdayDateSpan.text(weekDates[6]);
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
