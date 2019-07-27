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
timeHeader = $("#timeHeader");
calendarBody = $("#calendarBody");
nextButton = $("#nextButton");
previousButton = $("#previousButton");
createNewEntryButton = $("#createNewEntry");
weekViewButton = $("#weekView");

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"];

$(document).ready(function(){

    
    displayMonthView(currentMonth, currentYear);
    displayYearMonth(currentMonth, currentYear);

    createNewEntryButton.click(function(){
        console.log("toggling sidebar");
        $('.ui.sidebar').sidebar('toggle');
    });

    nextButton.click(function(){
        nextMonth();
    });

    previousButton.click(function(){
        previousMonth();
    });

    weekViewButton.click(function(){
        displayWeekView(currentMinutes, currentHour, currentDay, currentDate, currentMonth, currentYear);
    })
})


function displayYearMonth(month, year){
    yearDisplay.text(year);
    monthDisplay.text(months[month]);
}

function displayMonthView(month, year){

    timeHeader.hide();

    calendarBody.empty();
    tableContent = "";
    daysInMonth = calculateDaysInMonth(month, year);
    let startDay = (new Date(year, month)).getDay();

    console.log("StartDay: " + startDay);

    console.log("Year: " + year);
    console.log("Month: " + month);

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
                column = column + "<h1>dummyText</h1>"
                console.log("Day: " + dateCounter);
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
    if(currentMonth === 11){
        currentYear++;
        currentMonth = 0;
    }
    else{
        currentMonth++;
    }
    displayYearMonth(currentMonth, currentYear);
    displayMonthView(currentMonth, currentYear);
}

function previousMonth(){
    if(currentMonth === 0){
        currentYear--;
        currentMonth = 11;
    }
    else{
        currentMonth--;
    }
    displayYearMonth(currentMonth, currentYear);
    displayMonthView(currentMonth, currentYear);
}


function calculateDaysInMonth(month, year){

    return 32 - new Date(year, month, 32).getDate();
}

function displayWeekView(minutes, hour, day, date, month, year){
    
    timeTracker = new Date();
    timeTracker.setHours(00);
    timeTracker.setMinutes(00);
    
    // console.log("hours: " + hours);
    // console.log("minutes: " + minutes);

    timeHeader.show();
    calendarBody.empty();

    tableContent = "";

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

        }

        row = row + "</tr>";
        tableContent = tableContent + row;
    }

    calendarBody.append(tableContent);

}
