/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const speakOutput = requestAttributes.t('WELCOME_MESSAGE', requestAttributes.t('SKILL_NAME'));
    console.log('speakOutput');
    console.log(speakOutput);

    const repromptOutput = requestAttributes.t('WELCOME_REPROMPT');
    console.log('repromptOutput');
    console.log(repromptOutput);

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const RecipeHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RecipeIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const itemSlot = handlerInput.requestEnvelope.request.intent.slots.Item;
    let itemName;
    if (itemSlot && itemSlot.value) {
      itemName = itemSlot.value.toLowerCase();
      console.log('RecipeHandler:');
      console.log(itemName);
    }
    else {
      console.log('No itemSlot found');
      console.log(itemSlot);
      console.log(itemSlot.value);
    }

    const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), itemName);
    let speakOutput = "";

    if (itemName && itemName.toLowerCase() === 'vacations' || itemName.toLowerCase() === 'birthdays') {
      sessionAttributes.speakOutput = itemName;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      
      console.log('itemName good');
      console.log(itemName);
      console.log(sessionAttributes.speakOutput);
      console.log(cardTitle);

      return handlerInput.responseBuilder
        .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
        .withSimpleCard(cardTitle, itemName)
        .getResponse();
    }
    else {
      speakOutput = requestAttributes.t('ALBUM_NOT_FOUND_MESSAGE');
      const repromptSpeech = requestAttributes.t('ALBUM_NOT_FOUND_REPROMPT');
      if (itemName) {
        speakOutput += requestAttributes.t('ALBUM_NOT_FOUND_WITH_ITEM_NAME', itemName);
      } else {
        speakOutput += requestAttributes.t('ALBUM_NOT_FOUND_WITHOUT_ITEM_NAME');
      }
      speakOutput += repromptSpeech;

      sessionAttributes.speakOutput = speakOutput; //saving speakOutput to attributes, so we can use it to repeat
      sessionAttributes.repromptSpeech = repromptSpeech;

      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(sessionAttributes.speakOutput)
        .reprompt(sessionAttributes.repromptSpeech)
        .getResponse();
    }
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('HELP_MESSAGE');
    sessionAttributes.repromptSpeech = requestAttributes.t('HELP_REPROMPT');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = requestAttributes.t('STOP_MESSAGE', requestAttributes.t('SKILL_NAME'));

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

/* CONSTANTS */
const skillBuilder = Alexa.SkillBuilders.custom();
const languageStrings = {
  en: {
    translation: {
      SKILL_NAME: 'Photo Jeeves',
      WELCOME_MESSAGE: 'Welcome to %s. You can say, play album followed by the album name ... Now, what can I help you with?',
      WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
      DISPLAY_CARD_TITLE: '%s  - Album named %s.',
      HELP_MESSAGE: 'You can say play album followed by the album name, or, you can say exit...Now, what can I help you with?',
      HELP_REPROMPT: 'Hey, you can say play album followed by the album name, or you can say exit...Now, what can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
      ALBUM_REPEAT_MESSAGE: 'Try saying repeat.',
      ALBUM_NOT_FOUND_MESSAGE: 'I\'m sorry, I currently do not know ',
      ALBUM_NOT_FOUND_WITH_ITEM_NAME: 'the album %s. ',
      ALBUM_NOT_FOUND_WITHOUT_ITEM_NAME: 'that album. ',
      ALBUM_NOT_FOUND_REPROMPT: 'What else can I help with?'
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: 'Photo Jeeves'
    },
  },
  de: {
    translation: {
      SKILL_NAME: 'Assistent für Minecraft in Deutsch',
      WELCOME_MESSAGE: 'Willkommen bei %s. Du kannst beispielsweise die Frage stellen: Welche Rezepte gibt es für eine %s? ... Nun, womit kann ich dir helfen?',
      WELCOME_REPROMPT: 'Wenn du wissen möchtest, was du sagen kannst, sag einfach „Hilf mir“.',
      DISPLAY_CARD_TITLE: '%s - Rezept für %s.',
      HELP_MESSAGE: 'Du kannst beispielsweise Fragen stellen wie „Wie geht das Rezept für eine %s“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
      HELP_REPROMPT: 'Du kannst beispielsweise Sachen sagen wie „Wie geht das Rezept für eine %s“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
      STOP_MESSAGE: 'Auf Wiedersehen!',
    },
  },
};

// Finding the locale of the user
const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

// getRandomItem
function getRandomItem(arrayOfItems) {
  // the argument is an array [] of words or phrases
  let i = 0;
  i = Math.floor(Math.random() * arrayOfItems.length);
  return (arrayOfItems[i]);
};

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RecipeHandler,
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
