const HOURS_FOR_NEXT_CALL = 24;
const COP_KEY = "COP";
const LAST_READ_KEY = "lastRead";

document.addEventListener("DOMContentLoaded", function() {
    init();
});

function init(){
    let displayInfo = true;
    let lastReadDate = getLastReadDate();

    if(!existLastRead(lastReadDate)){
        displayInfo = false;
        loadCurrency();
    }

    if(havePassedTimeInHours(HOURS_FOR_NEXT_CALL, lastReadDate)){
        displayInfo = false;
        loadCurrency();
    }

    if(displayInfo){
        showInfo();
    }
}

function getLastReadDate(){
    let lastReadDate = localStorage.getItem(LAST_READ_KEY);

    if(lastReadDate == null){
        return null;
    }
    
    return new Date(lastReadDate);
}

function existLastRead(lastReadDate){
    return lastReadDate != null;
}

function loadCurrency(){
    fetch('https://v6.exchangerate-api.com/v6/8f00c0bf6abb8a108bb4e0a8/latest/CLP')
        .then(response => response.json())
        .then(data => {
            console.log("set NEW COP value...");
            localStorage.setItem(COP_KEY, data.conversion_rates.COP)

            console.info("set NEW last read value...");
            localStorage.setItem(LAST_READ_KEY, new Date());

            showInfo();
        });
}

function havePassedTimeInHours(hours, lastReadDate){
    let today = new Date();
    let diffHrs = getDiffInHour(today, lastReadDate);

    return diffHrs >= hours;
}

function getDiffInHour(today, lastReadDate){
    let diffMs = (today - lastReadDate);
    return Math.floor((diffMs % 86400000) / 3600000);
}

function showInfo(){
    let lastReadDate = getLastReadDate();
    let today = new Date();
    let diffHrs = getDiffInHour(today, lastReadDate);

    console.log("Diff in hours  : " + diffHrs);
    console.log("lastRead       : " + lastReadDate);
    console.log("COP            : " + localStorage.getItem(COP_KEY));
}