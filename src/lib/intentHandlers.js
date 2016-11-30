/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.IsPetHappyIntent = function (intent, session, response) {
        //reset scores for all existing players
        storage.loadGame(session, function (currentGame) {                      
            response.tell(textHelper.getHappinessText(currentGame));
        });
    };

    intentHandlers.FeedPetIntent = function (intent, session, response) {        
        storage.loadGame(session, function (currentGame) {            
            currentGame.data.hunger = currentGame.data.hunger - 20;
            
            currentGame.save(function () {
                response.tell("Dazzle is chowing down!");
            });
        });
    };

    intentHandlers.ResetPetIntent = function (intent, session, response) {
        //remove all players
        storage.newGame(session).save(function () {
            response.tell('Old Dazzle has gone to digital pet heaven. New Dazzle has arrived from the pet store!');
        });
    };
    
    intentHandlers.FetchPetIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {            
            currentGame.data.needToPlay = currentGame.data.needToPlay - 20;
            
            currentGame.save(function () {
                response.tell("Dazzle caught the ball!");
            });
        });
    };
    
    //todo: walk intent - always hits exercise, also random chance of peeing
    intentHandlers.WalkPetIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {            
            currentGame.data.needToExercise = currentGame.data.needToExercise - 20;
            
            currentGame.save(function () {
                response.tell("Dazzle and you went for a brisk walk!");
            });
        });
    };    

    // todo:pee intent - random chance of peeing - chance increases as needToPee increases
    intentHandlers.LetPetPeeIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {            
            currentGame.data.needToPee = 0;
            
            currentGame.save(function () {
                response.tell("Dazzle found a nice tree and marked her territory.");
            });
        });
    };
       
    //todo: discipline intent - increases discipline but decreases happiness; discipline declines very slowly
    // todo:pee intent - random chance of peeing - chance increases as needToPee increases
    intentHandlers.DisciplinePetIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {            
            currentGame.data.discipline = currentGame.data.discipline + 10;
            //todo: might need to mark last time disciplined and decrease happiness if recently
            
            currentGame.save(function () {
                response.tell("Dazzle looks chastised.");
            });
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;
