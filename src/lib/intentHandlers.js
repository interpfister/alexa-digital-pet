/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

//TODO: random chance of the discipline bad things happening here; also check on happiness                
    //low random chance of bad things happening if discipline is low -- biting you, scratching floor, peeing in house
function randomBadThing(data) {
    var peeRandom = (data.needToPee/100) * ((1 - data.discipline/100)) * Math.random();
    console.log("Pee random: " + peeRandom);
    
    var exerciseRandom = (data.needToExercise/100) * ((1 - data.discipline/100)) * Math.random();
    console.log("Exercise random: " + exerciseRandom);
    
    if(peeRandom > .8) {
        return ["Uh oh! Dazzle just peed on the carpet!", "Oh no! Dazzle just peed on your shoes!", "Oops! Dazzle just went number 2 on the sofa!"].randomElement();
    } else if(exerciseRandom > .8) {
        return ["Uh oh! Dazzle just chewed up a pillow!", "Crisis! Dazzle just scratched up the floor!"].randomElement();
    } else {
        return null;
    }
}

function callBadThingOrResponse(response, currentGame, functionIfNoBadThing) {
    var badThing = randomBadThing(currentGame.data);
    if(badThing) {
        response.ask(badThing + " What would you like to do next?");
    } else {
        functionIfNoBadThing(currentGame);
    }
}

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.IsPetHappyIntent = function (intent, session, response) {
        //reset scores for all existing players
        storage.loadGame(session, function (currentGame) {
            callBadThingOrResponse(response, currentGame, function(currentGame) {
                response.ask({type:'SSML', speech: '<speak>' + textHelper.getHappinessText(currentGame) + '<audio src="https://s3.amazonaws.com/alexa-digital-pet-assets/alexa-bark.mp3" />'  + " What would you like to do next?</speak>"});
            });
        });
    };
    
    intentHandlers.FeedPetIntent = function (intent, session, response) {        
        storage.loadGame(session, function (currentGame) {            
            callBadThingOrResponse(response, currentGame, function(currentGame) {
                currentGame.data.hunger = 0;
            
                currentGame.save(function () {
                    response.ask(["Dazzle is chowing down! ","Dazzle eagerly eats up the food."].randomElement() + " What would you like to do next?");
                });
            });                       
        });
    };

    intentHandlers.ResetPetIntent = function (intent, session, response) {
        storage.newGame(session).save(function () {
            response.ask('Old Dazzle has gone to digital pet heaven. New Dazzle has arrived from the pet store! What would you like to do next?');
        });
    };
    
    intentHandlers.FetchPetIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {
            callBadThingOrResponse(response, currentGame, function(currentGame) {
                currentGame.data.needToPlay = currentGame.data.needToPlay - 30;
            
                currentGame.save(function () {
                    response.ask(["Dazzle caught the ball!","Dazzle missed the ball but she chased it down."].randomElement() + " What would you like to do next?");
                });
            });
        });
    };
    
    //todo: walk intent - always hits exercise, also random chance of peeing
    intentHandlers.WalkPetIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {            
            callBadThingOrResponse(response, currentGame, function(currentGame) {
                currentGame.data.needToExercise = 0;
            
                currentGame.save(function () {
                    response.ask(["Dazzle and you went for a brisk walk!","Dazzle chased a squirrel on your walk!","Back from the walk! Dazzle made friends with one of the neighbor's dogs on the way."].randomElement() + " What would you like to do next?");
                });
            });
        });
    };    

    // todo:pee intent - random chance of peeing - chance increases as needToPee increases
    intentHandlers.LetPetPeeIntent = function (intent, session, response) {
        storage.loadGame(session, function (currentGame) {            
            callBadThingOrResponse(response, currentGame, function(currentGame) {
                currentGame.data.needToPee = 0;
                
                currentGame.save(function () {
                    response.ask(["Dazzle found a nice tree and marked her territory.", "Dazzle went number 2 in the yard, but you picked it up and threw it away.","Dazzle marked a bunch of trees."].randomElement() + " What would you like to do next?");
                });
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
                response.ask(["Dazzle looks chastised.","You're quite the dog whisper."].randomElement() + " Anything else you'd like to do?");
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
