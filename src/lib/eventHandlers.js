/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        //if user said a one shot command that triggered an intent event,
        //it will start a new session, and then we should avoid speaking too many words.
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        //Speak welcome message and ask user questions
        //based on whether there are players or not.
        storage.loadGame(session, function (currentGame) {
            var speechOutput = '',
                reprompt;
            if (currentGame.isNewPet) {

                speechOutput += 'Thanks for taking care of my pet Dazzle! What would you like to do?';
                
                currentGame.data.isNewPet = false;
                currentGame.save();                
            } else {
                speechOutput += 'Welcome back! ' + textHelper.getHappinessText(currentGame);
                reprompt = textHelper.nextHelp;
            }
            response.ask({type:'SSML', speech:'<speak>' + speechOutput + '<audio src="https://s3.amazonaws.com/alexa-digital-pet-assets/alexa-bark.mp3" /></speak>'}, reprompt);
        });
    };
};
exports.register = registerEventHandlers;
