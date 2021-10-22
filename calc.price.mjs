const PRICE_CHAR_EN = 0.12;
const PRICE_CHAR_RU = 0.05;
const PRICE_CHAR_UA = 0.05;

const PRICE_ALL_MIN_EN = 120;
const PRICE_ALL_MIN_RU = 50;
const PRICE_ALL_MIN_UA = 50;

const PRICE_COEF = 1.2;

const HOUR = 60 * 60 * 1000;
const BASE_TIME = 30 * 60 * 1000;
const WORK_MIN_TIME = 60 * 60 * 1000;

const PERF_CHAR_HOUR_EN = 333;
const PERF_CHAR_HOUR_RU = 1333;
const PERF_CHAR_HOUR_UA = 1333;

const TIME_COEF = 1.2;

const WORK_HOUR_START = 10;
const WORK_HOUR_STOP = 19;
const WORK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SKIP_DAY = 24 * 60 * 60 * 1000;
const SKIP_HOUR = 60 * 60 * 1000;


//const CURRENT_TIME = new Date('Oct 22 2021 12: GMT+0300').getTime();
//const CURRENT_TIME = new Date('Oct 21 2021 07: GMT+0300').getTime();
//const CURRENT_TIME = new Date('Oct 21 2021 20: GMT+0300').getTime();
//const CURRENT_TIME = new Date('Oct 23 2021 12: GMT+0300').getTime();
//const CURRENT_TIME = new Date('Oct 23 2021 06: GMT+0300').getTime();
const CURRENT_TIME = Date.now();

export function calcPrice(lang, countChar, unknownFile) {
	
	if(lang !== 'en' && lang !== 'ua' && lang !== 'ru') {
		throw new CalcPriceError(`Lang: ${lang} - NOT FOUND`);
	}
	
	if(!Number.isInteger(countChar) || countChar <= 0) {
		throw new CalcPriceError(`Count Char: ${countChar} - INCORRECT`);
	}
	
	// price
	let price = 0;
	
	if(lang === 'en') {
		price = countChar * PRICE_CHAR_EN;
	} else if(lang === 'ru') {
		price = countChar * PRICE_CHAR_RU;
	} else if(lang === 'ua') {
		price = countChar * PRICE_CHAR_UA;
	}
	
	if(unknownFile) {
		price = price * PRICE_COEF;
	}
	
	if(lang === 'en') {
		if(price < PRICE_ALL_MIN_EN) price = PRICE_ALL_MIN_EN;
	} else if(lang === 'ru') {
		if(price < PRICE_ALL_MIN_RU) price = PRICE_ALL_MIN_RU;
	} else if(lang === 'ua') {
		if(price < PRICE_ALL_MIN_UA) price = PRICE_ALL_MIN_UA;
	}
	
	// time
	let time = BASE_TIME;
	
	if(lang === 'en') {
		time += Math.round((countChar / PERF_CHAR_HOUR_EN) * HOUR);
	} else if(lang === 'ru') {
		time += Math.round((countChar / PERF_CHAR_HOUR_RU) * HOUR);
	} else if(lang === 'ua') {
		time += Math.round((countChar / PERF_CHAR_HOUR_UA) * HOUR);
	}
	
	if(unknownFile) {
		time = Math.round(time * TIME_COEF);
	}
	
	if(lang === 'en') {
		if(time < WORK_MIN_TIME) time = WORK_MIN_TIME;
	} else if(lang === 'ru') {
		if(time < WORK_MIN_TIME) time = WORK_MIN_TIME;
	} else if(lang === 'ua') {
		if(time < WORK_MIN_TIME) time = WORK_MIN_TIME;
	}
	
	// deadline
	let bankTime = time;
	let endTime = CURRENT_TIME;
	let endRealTime = CURRENT_TIME;
	let currTime = CURRENT_TIME;
	
	while(bankTime > 0) {
		// skip off day
		if(!WORK_DAYS.includes(getDayOfWeek(currTime))) {
			currTime += SKIP_DAY;
			
			let date = new Date(currTime);
			date.setHours(WORK_HOUR_START);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			
			currTime = date.getTime();
			endTime = currTime;
			
			continue;
		}
		
		// skip off time
		let currHours = new Date(currTime).getHours();
		if(currHours < WORK_HOUR_START) {
			
			let date = new Date(currTime);
			date.setHours(WORK_HOUR_START);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			
			currTime = date.getTime();
			endTime = currTime;
			
			continue;
		} else if(currHours >= WORK_HOUR_STOP) {
			
			currTime += SKIP_DAY;
			
			let date = new Date(currTime);
			date.setHours(WORK_HOUR_START);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			
			currTime = date.getTime();
			endTime = currTime;
			
			continue;
		}
		
		let currDateTime = new Date(currTime);
		let endDateTime = new Date(currTime);
		endDateTime.setHours(WORK_HOUR_STOP);
		endDateTime.setMinutes(0);
		endDateTime.setSeconds(0);
		endDateTime.setMilliseconds(0);
		
		let currDayDiff = endDateTime.getTime() - currDateTime.getTime();
		
		if(bankTime > currDayDiff) {
			currTime = currDateTime.getTime() + currDayDiff;
			endTime = currTime;
			
			bankTime = bankTime - currDayDiff;
			
			continue;
		} else {
			currTime = currDateTime.getTime() + bankTime;
			endTime = currTime;
			
			bankTime = 0;
			
			// round end time
			endRealTime = endTime;
			
			let endDate = new Date(endTime);
			if(endDate.getMinutes() > 0 || endDate.getSeconds() > 0 || endDate.getMilliseconds() > 0) {
				endDate.setHours(endDate.getHours() + 1);
				endDate.setMinutes(0);
				endDate.setSeconds(0);
				endDate.setMilliseconds(0);
				
				endTime = endDate.getTime();
			}
			
			// break;
		}
	}
	
	return {
		price, 
		time, 
		time_hours: time/HOUR, 
		deadline: endTime,
		deadline_real_date: new Date(endRealTime).toString(),
		deadline_date: new Date(endTime).toString()};
}

export class CalcPriceError extends Error {}

const NAME_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayOfWeek(date) {
	const dayOfWeek = new Date(date).getDay();
	return isNaN(dayOfWeek) ? null : NAME_DAYS[dayOfWeek];
}
