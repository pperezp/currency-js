const HOURS_FOR_NEXT_CALL = 24;

const COP_KEY = "COP";
const CLP_KEY = "CLP";

const BASE_CURRECY_KEY = CLP_KEY;
const CLP_CONVERSION_RATES_KEY = "clpConversionRates";
const BASE_CONVERSION_RATES_KEY = CLP_CONVERSION_RATES_KEY;

const LAST_READ_KEY = "lastRead";

const API_KEY = "8f00c0bf6abb8a108bb4e0a8";
const API_URL = "https://v6.exchangerate-api.com/v6/" + API_KEY +"/latest/";

let currenciesArray;
let switchButton;
let inputCurrencyTag;
let outputCurrencyTag; 
let fromCurrencyTag;
let toCurrencyTag;

document.addEventListener("DOMContentLoaded", function() {
    init();
});

function init(){
    let displayInfo = true;
    let lastReadDate = getLastReadDate();

    if(!existLastRead(lastReadDate)){
        displayInfo = false;
        loadCurrencies();
    }

    if(havePassedTimeInHours(HOURS_FOR_NEXT_CALL, lastReadDate)){
        displayInfo = false;
        loadCurrencies();
    }

    if(displayInfo){
        showInfo();
        loadArrayCurrencies();
    }

    initView();
    initEvents();
}

function initEvents(){
    switchButton.addEventListener("click", function(){
        let aux = fromCurrencyTag.value;
        let fromValue = toCurrencyTag.value;
        let toValue = aux;
    
        document.querySelector("#from").value = fromValue;
        document.querySelector("#to").value = toValue;

        loadOutputCurrency();
    });

    inputCurrencyTag.addEventListener("keyup", function(){
        loadOutputCurrency();
    });
}

function initView(){
    switchButton = document.querySelector("#switchButton");
    outputCurrencyTag = document.querySelector("#output");
    inputCurrencyTag = document.querySelector("#pesos");
    fromCurrencyTag = document.querySelector("#from");
    toCurrencyTag = document.querySelector("#to");

    loadOutputCurrency();
}

function loadOutputCurrency(){
    let outputValue = transform(inputCurrencyTag.value, fromCurrencyTag.value, toCurrencyTag.value);
    outputCurrencyTag.value = outputValue;
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

function loadCurrencies(){
    loadCurrency(BASE_CURRECY_KEY, BASE_CONVERSION_RATES_KEY);
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
    console.log("CLP            : " + localStorage.getItem(BASE_CONVERSION_RATES_KEY));
}

function loadCurrency(baseCurrency, conversionRatesKey){
    fetch(API_URL + baseCurrency)
        .then(response => response.json())
        .then(data => {

            let conversionRates = JSON.stringify(data.conversion_rates)

            console.log("set " + conversionRatesKey + " value...");
            localStorage.setItem(conversionRatesKey, conversionRates);

            console.info("set NEW last read value...");
            localStorage.setItem(LAST_READ_KEY, new Date());

            loadArrayCurrencies();

            showInfo();
        });
}

function loadArrayCurrencies(){
    currenciesArray = new Array();
    var conversionRates = JSON.parse(localStorage.getItem(BASE_CONVERSION_RATES_KEY));

    for(let conversionRate in conversionRates){
        currenciesArray.push(conversionRate);
    }
}

function transform(pesos, fromCurrency, toCurrency){
    let baseCurrencyPesos = toBaseCurrencyPesos(pesos, fromCurrency);
    let toCurrencyPesos = transformBaseCurrencyTo(toCurrency, baseCurrencyPesos);

    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: toCurrency }).format(toCurrencyPesos);
}

function transformBaseCurrencyTo(currency, pesos){
    let conversionRate = getConversionRate(CLP_CONVERSION_RATES_KEY, currency);

    return conversionRate * pesos;
}

function toBaseCurrencyPesos(pesos, currency){
    let conversionRate = getConversionRate(CLP_CONVERSION_RATES_KEY, currency);

    return pesos / conversionRate;
}

function getConversionRate(conversionRatesKey, currency){
    var conversionRates = JSON.parse(localStorage.getItem(conversionRatesKey));

    for(let conversionRate in conversionRates){
        if(conversionRate == currency){
            console.log(conversionRate + " - " + conversionRates[conversionRate]); 
            return conversionRates[conversionRate];
        }
    }
}

