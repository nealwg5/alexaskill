/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/



/**
 * App ID for the skill
 */
var APP_ID = ""; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');


var urlPrefix = 'https://avelqu6i45.execute-api.us-east-1.amazonaws.com/jwatch_stage/search?articleClass=Medical%20News&startDate=';
var urlNEJM = 'https://ilerxy5ujh.execute-api.us-east-1.amazonaws.com/nejm_stage/search?query=has_oa_conclusions:true%20AND%20&startDate=';

/**
 * Variable defining number of events to be read at one time
 */
var paginationSize = 10;
var publication = "";
/**
 * Variable defining the length of the delimiter between events
 */
var delimiterSize = 0;

/**
 * fwatch is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var fwatch = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
fwatch.prototype = Object.create(AlexaSkill.prototype);
fwatch.prototype.constructor = fwatch;

fwatch.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("fwatch onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

fwatch.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("fwatch onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

fwatch.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

fwatch.prototype.intentHandlers = {

    "GetFirstEventIntent": function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },

    "GetNextEventIntent": function (intent, session, response) {
        handleNextEventRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Physician's First Watch, you can get medical articles for any day of the year.  " +
            "For example, you could say today, or August thirtieth, or you can say exit. Now, which day do you want?";
        var repromptText = "Which day do you want?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
            speech: "Goodbye",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
            speech: "Goodbye",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Physician's First Watch";
    var repromptText = "With Physician's First Watch, you can get medical articles for any day of the year for both NEJM and First Watch.  For example, you could say Journal Watch or NEJM";
    var speechText = "<p>Physician's First Watch.</p> <p>Which journal do you want articles for?. For example, you could say First Watch, or N E J M</p>";
    var cardOutput = "Physician's First Watch. Which journal do you want articles for?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}


/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleFirstEventRequest(intent, session, response) {
    var pubSlot = intent.slots.pub;
    var pubvalue = JSON.stringify(pubSlot.value);
    var fwatch = "\"1st watch\"";
    var nejm = "\"new England journal of medicine\"";
    var nejm1 = "\"NEJM\"";
    if (pubvalue.valueOf() == fwatch.valueOf() || pubvalue.valueOf() == nejm1.valueOf() || pubvalue.valueOf() == nejm.valueOf()) {
        publication = pubvalue;
    } else {
        publication = "wrong";
    }
    if (publication == "wrong") {
        var speechOutput =
            {
                speech: "<speak>" + "This is not a valid journal, For example, you could First Watch, or New England Journal of Medicine" + "</speak>",
                type: AlexaSkill.speechOutputType.SSML

            }
    }
    else if (publication == nejm1 || publication == nejm) {
        var speechOutput =
            {
                speech: "<speak>" + "You chose" + " N E J M " + " ,you can get medical articles for any day of the year. For example, you could say today, or August thirtieth. Now, which day do you want?" + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            }
    }
    else {
        var speechOutput =
            {
                speech: "<speak>" + "You chose" + " Physician's First Watch " + " ,you can get medical articles for any day of the year. For example, you could say today, or August thirtieth. Now, which day do you want?" + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            }
    }
    response.ask(speechOutput);
    console.log(publication);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleNextEventRequest(intent, session, response) {
    var daySlot = intent.slots.day;
    var pubSlot = intent.slots.pub;
    var lateSlot = intent.slots.latest;

    if (typeof pubSlot.value !== "undefined") {
        publication = JSON.stringify(pubSlot.value);
    }


    var repromptText = "With Physician's First Watch, you can get medical articles for any day of the year. For example, you could say today, or August thirtieth. Now, which day do you want?";
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var date = "";

    var breaktime = "<break time = \".5s\"/>";
    date = new Date(daySlot.value);


//When latest slot is invoked
if (typeof lateSlot.value !== "undefined") {
    var lateDate = lateSlot.value.toString()
    console.log(lateDate);
    if (lateDate == "latest" || lateDate == "recent" || lateDate == "most recent") {
        date = new Date();
    }
}



    var currentDate = new Date();
    var testDate = new Date(daySlot.value);
    var year = currentDate.getFullYear();
    testDate.setFullYear(year);

    var prefixContent = "<p>For " + monthNames[date.getMonth()] + " " + date.getDate() + ", </p>";
    var cardContent = "For " + monthNames[date.getMonth()] + " " + date.getDate() + ", ";

    var cardTitle = "Articles For " + monthNames[date.getMonth()] + " " + date.getDate();

    var fwatch = "\"1st watch\"";
    var fwatch2 = "physician\'s 1st watch";
    var nejm = "\"new England journal of medicine\"";
    var nejm1 = "\"NEJM\"";


    //When day slot is invoked 
    if (typeof daySlot.value !== "undefined") {
        //break out function when date is invalid 
        if (daySlot.value.toString() == "") {
            var speechOutput =
                {
                    speech: "<speak>" + "This is not a valid date, please choose another date" + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                }
            response.tell(speechOutput);
            return;
        }


        //break out function when date is in the future. 
        if (testDate > currentDate) {
            var speechOutput =
                {
                    speech: "<speak>" + "This date is in the future, please choose another date" + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                }
            response.tell(speechOutput);
            return;
        }
    }

    if (publication.valueOf() == fwatch.valueOf() || publication.valueOf() == fwatch2.valueOf()) {
        getJsonEventsFromFW(date.getMonth() + 1, date.getDate(), function (events) {
            var speechText = "",
                i;
            if (events.length == 0) {
                speechText = "There are no articles on this date. Please try again later.";
                cardContent = speechText;
                response.tell(speechText);
            } else {
                for (i = 0; i < events.length; i++) {
                    cardContent = cardContent + events[i].title + events[i].extract + events[i].url + " ";
                    speechText = "<p>" + speechText + events[i].title + breaktime + events[i].extract + breaktime + "</p> ";
                };
                //speechText = speechText + "<p>Want more articles?</p>";
                speechText = speechText + "<p></p>";
                var speechOutput = {
                    speech: "<speak>" + prefixContent + speechText + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };
                var repromptOutput = {
                    speech: repromptText,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
            }
            publication = "";
        });
    }
    else if (publication.valueOf() == nejm.valueOf() || publication.valueOf() == nejm1.valueOf()) {
        getJsonEventsFromNEJM(date.getMonth() + 1, date.getDate(), function (events) {
            var speechText = "",
                i;
            if (events.length == 0) {
                speechText = "There is no N E J M articles on this date. Please try again later or choose another date";
                cardContent = speechText;
                response.tell(speechText);
            } else {
                for (i = 0; i < events.length; i++) {
                    cardContent = cardContent + events[i].title + events[i].extract + events[i].url + " ";
                    speechText = "<p>" + speechText + events[i].title + breaktime + events[i].extract + breaktime + "</p> ";
                };
                //speechText = speechText + "<p>Want more articles?</p>";
                speechText = speechText + "<p></p>";
                var speechOutput = {
                    speech: "<speak>" + prefixContent + speechText + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };
                var repromptOutput = {
                    speech: repromptText,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
            }
            publication = "";
        });
    }
    else {
        speechText = "You need to choose a valid journal. For example, you could First Watch, or N E J M ";
        cardContent = speechText;
        response.tell(speechText);

    }
}

function getJsonEventsFromFW(day, date, eventCallback) {

    var d = new Date();
    d.setDate(date);


    var year = d.getFullYear();
    var stringDay = day.toString();


    var slicedDay = '0' + stringDay.slice(-2);
    var slicedDate = ('0' + d.getDate()).slice(-2);


    var finalDate = year + '-' + slicedDay + '-' + slicedDate;

    var endDate = "&endDate=" + finalDate;

    var urlDate = finalDate + endDate;



    var url = urlPrefix + urlDate;

    console.log(url);

    var retArr = [];

    https.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });



        res.on('end', function () {

            var parentObject1 = JSON.parse(body);
            var parentObject2 = parentObject1.json;
            var parentObject3 = parentObject2.results;
            var parentArray = parentObject3.result;
            if (parentArray == null) {
                retArr.length = 0;
            }
            else {
                for (var i = 0; i < parentArray.length; i++) {
                    var objTitle = parentArray[i].title;
                    var objExtract = parentArray[i].extract;
                    var objURL = parentArray[i].doi;

                    var objStringT = JSON.stringify(objTitle);
                    var newTitle = "Title:" + objStringT + "\n";

                    var objStringE = JSON.stringify(objExtract);
                    var newExtract = "Summary:" + objStringE + "\n";
                    var escapeTitle = newTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    var escapeExtract = newExtract.replace(/&rsquo;/g, "’");


                    var objStringURL = JSON.stringify(objURL);
                    var cutURL = objStringURL.replace('10.1056/nejm-jw.', '');
                    cutURL = cutURL.replace(/['"]+/g, '');

                    var newURL = "http://www.jwatch.org/" + cutURL + '\n';

                    var retObj = {};

                    retObj['title'] = escapeTitle;
                    retObj['extract'] = escapeExtract;
                    retObj['url'] = newURL;

                    retArr.push(retObj);

                }
            }
            console.log(retArr);
            eventCallback(retArr);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function getJsonEventsFromNEJM(day, date, eventCallback) {


    var d = new Date();
    d.setDate(date);
    d.setMonth(day - 1);
    var thurs = d.getDay() + 3;
    var newDate = thurs % 7

    if (newDate != 0) {
        thurs = d.getDate() - newDate
        d.setDate(thurs);
    }


    var year = d.getFullYear();
    var month = d.getMonth() + 1
    var stringDay = month.toString();
    var stringDate = d.getDate().toString();


    var slicedDay = '0' + stringDay.slice(-2);
    var slicedDate = ('0' + d.getDate()).slice(-2);


    var finalDate = year + '-' + slicedDay + '-' + slicedDate;

    var endDate = "&endDate=" + finalDate;

    var urlDate = finalDate + endDate;


    var url = urlNEJM + urlDate;

    console.log(url);


    var retArr = [];

    https.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });



        res.on('end', function () {

            var parentObject1 = JSON.parse(body);
            var parentObject2 = parentObject1.json;
            var parentObject3 = parentObject2.results;
            var parentArray = parentObject3.result;
            if (parentArray == null) {
                retArr.length = 0;
            }
            else {
                for (var i = 0; i < parentArray.length; i++) {
                    var objTitle = parentArray[i].title;
                    var objExtract = parentArray[i].oa_conclusion;
                    var objURL = parentArray[i].doi;

                    var objStringT = JSON.stringify(objTitle);
                    var newTitle = "Title:" + objStringT + "\n";

                    var objStringE = JSON.stringify(objExtract);
                    var toStringExtract = objStringE.toString();
                    var replacedExtract = objStringE.replace(/\\n/g, "");
                    var newExtract = "Summary:" + replacedExtract + "\n";

                    var objStringURL = JSON.stringify(objURL);
                    var newURL = "http://www.nejm.org/doi/full/" + objStringURL + '\n';
                    var retObj = {};

                    retObj['title'] = newTitle;
                    retObj['extract'] = newExtract;
                    retObj['url'] = newURL;

                    retArr.push(retObj);

                }
            }
            eventCallback(retArr);
            console.log(retArr); 
        });

    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}




// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {

    var skill = new fwatch();
    skill.execute(event, context);
};
