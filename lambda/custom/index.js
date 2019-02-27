/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const https = require('https');
const request = require('request');
const bsCore = require('@brightsign/bscore');
const bsnConnector = require('@brightsign/bsnconnector');
const bsnGetSession = bsnConnector.bsnGetSession;
const bsnConnectorConfig = bsnConnector.bsnConnectorConfig;
const dwsManager = require('@brightsign/bs-dws-manager');
const getDwsConnector = dwsManager.getDwsConnector;

var accessToken = '';

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // connectToPreviewServer();

    console.log('invoke getOAuthToken');
    getOAuthToken();

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

function getOAuthToken() {

  var jsonBody =
  {
    "grant_type": "password",
    "username": "ted@brightsign.biz",
    "password": "P@ssw0rd"
  };

  request({
    url: 'https://oademo.brightsignnetwork.com/v1/token',
    method: "POST",
    auth: {
      'user': '8ybX72Gt',
      'pass': 'oJkARlw1-Ta2G-5WMo-gKJ3-5RxvHpaD5Ngk'
    },
    json: true,
    body: jsonBody
  }, function (error, response, body) {

    console.log('received response, accessToken:');
    console.log(response.body.access_token);

    accessToken = response.body.access_token;
  });
}

const sendPlayAlbum = (albumName) => {

    // send custom command to BrightSign
    jsonBody = {
      'data': {
        'command': 'album!!' + albumName.toLowerCase(),
        'return immediately': true,
      }
    };

    request({
      url: 'https://wsdemo.brightsignnetwork.com/rest/v1/custom?destinationType=player&destinationName=D7D834000029',
      method: "PUT",
      auth: {
        'bearer': accessToken,
      },
      json: true,
      body: jsonBody
    }, function (error, response, body) {

      console.log('error');
      console.log(error);

      console.log('received response, body:');
      console.log(response.body);

      sendResumePlayback();
    });
}

const sendPausePlayback = () => {

  jsonBody = {
    'data': {
      'command': 'pausePlayback',
      'return immediately': true,
    }
  };

  console.log('pausePlayback');

  request({
    url: 'https://wsdemo.brightsignnetwork.com/rest/v1/custom?destinationType=player&destinationName=D7D834000029',
    method: "PUT",
    auth: {
      'bearer': accessToken,
    },
    json: true,
    body: jsonBody
  }, function (error, response, body) {

    console.log('error');
    console.log(error);

    console.log('received response, body:');
    console.log(response.body);
  });
}

const sendResumePlayback = () => {

  jsonBody = {
    'data': {
      'command': 'startPlayback',
      'return immediately': true,
    }
  };

  console.log('startPlayback');

  request({
    url: 'https://wsdemo.brightsignnetwork.com/rest/v1/custom?destinationType=player&destinationName=D7D834000029',
    method: "PUT",
    auth: {
      'bearer': accessToken,
    },
    json: true,
    body: jsonBody
  }, function (error, response, body) {

    console.log('error');
    console.log(error);

    console.log('received response, body:');
    console.log(response.body);
  });
}

const sendRewindPlayback = () => {

  jsonBody = {
    'data': {
      'command': 'rewind',
      'return immediately': true,
    }
  };

  console.log('startPlayback');

  request({
    url: 'https://wsdemo.brightsignnetwork.com/rest/v1/custom?destinationType=player&destinationName=D7D834000029',
    method: "PUT",
    auth: {
      'bearer': accessToken,
    },
    json: true,
    body: jsonBody
  }, function (error, response, body) {

    console.log('error');
    console.log(error);

    console.log('received response, body:');
    console.log(response.body);
  });
}


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

    if (accessToken === '') {
      speakOutput = requestAttributes.t('NO_ACCESS_TOKEN');
      const repromptSpeech = requestAttributes.t('NO_ACCESS_TOKEN_REPROMPT');
      speakOutput += repromptSpeech;

      sessionAttributes.speakOutput = speakOutput; //saving speakOutput to attributes, so we can use it to repeat
      sessionAttributes.repromptSpeech = repromptSpeech;

      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(sessionAttributes.speakOutput)
        .reprompt(sessionAttributes.repromptSpeech)
        .getResponse();
    }
    else if (itemName !== '') {

      // check to see if album is in the list
      sendPlayAlbum(itemName);

      sessionAttributes.speakOutput = itemName;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      console.log('album name specified as:');
      console.log(itemName);
      console.log(sessionAttributes.speakOutput);
      console.log(cardTitle);

      return handlerInput.responseBuilder
        .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
        .withSimpleCard(cardTitle, itemName)
        .withShouldEndSession(false)
        // .shouldEndSession(false)
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

const StopHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log('StopIntent received');

    sendPausePlayback();

    const speakOutput = 'pause playback';

    sessionAttributes.speakOutput = speakOutput;
    sessionAttributes.repromptSpeech = speakOutput;

    const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), speakOutput);

    return handlerInput.responseBuilder
    .speak('pause playback')
    .withSimpleCard(cardTitle, speakOutput)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const ResumeHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ResumeIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log('ResumeIntent received');

    sendResumePlayback();

    const speakOutput = 'resume playback';

    sessionAttributes.speakOutput = speakOutput;
    sessionAttributes.repromptSpeech = speakOutput;

    const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), speakOutput);

    return handlerInput.responseBuilder
    .speak(speakOutput)
    .withSimpleCard(cardTitle, speakOutput)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const RewindHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RewindIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log('RewindIntent received');

    sendRewindPlayback();

    const speakOutput = 'rewind playback';

    sessionAttributes.speakOutput = speakOutput;
    sessionAttributes.repromptSpeech = speakOutput;

    const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), speakOutput);

    return handlerInput.responseBuilder
    .speak(speakOutput)
    .withSimpleCard(cardTitle, speakOutput)
    .withShouldEndSession(false)
    .getResponse();
  },
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
      ALBUM_NOT_FOUND_REPROMPT: 'What else can I help with?',
      NO_ACCESS_TOKEN: 'Unable to login to the BSN server',
      NO_ACCESS_TOKEN_REPROMPT: 'Try exiting and restarting the application'
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: 'Photo Jeeves'
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

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RecipeHandler,
    StopHandler,
    ResumeHandler,
    RewindHandler,
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

// code to use preview server via BrightSign packages rather than via http
const previewConfig = {
  "bsnClient": {
    "id": "BrightAuthor:Connect",
    "secret": "6F8933A0-416E-43B7-8162-FBF3DCF6A512"
  },
  "oAuthClient": {
    "id": "8ybX72Gt",
    "secret": "oJkARlw1-Ta2G-5WMo-gKJ3-5RxvHpaD5Ngk",
    "refreshExpirationInterval": 300000
  },
  "oAuthServerConfiguration": {
    "oAuthTokenUrl": "https://oademo.brightsignnetwork.com/v1/token"
  },
  "bDeployServerConfiguration": {
    "bDeployUrl": "https://provisiondemo.brightsignnetwork.com"
  },
  "bsnServerConfiguration": {
    "bsnDefaultUrl": "https://preview.brightsignnetwork.com",
    "bsnAuthEndpoint": "/2017/01/REST/",
    "bsnRestApiEndpoint": "/2018/09/REST/",
    "bsnUploadApiEndpoint": "/2017/01/REST/"
  }
};

function connectToPreviewServer() {

  bsnConnectorConfig(previewConfig);

  const destination = {type: 'player', name: 'D7D834000029'};
  const payload = {
    route: '/v1/custom',
    method: 'PUT',
    data: {
      command: 'album!!test',
      returnImmediately: true
    }
  };

  const session = bsnGetSession();
  const userName = 'ted@brightsign.biz';
  const password = 'P@ssw0rd';
  console.log('invoke session.activate');
  session.activate(userName, password)
    .then( () => {
      console.log('session.activate success');
      console.log('invoke bsnGetSession.fetchOAuthToken()');
      return bsnGetSession().fetchOAuthToken()
    }).then((token) => {
      console.log('token:');
      console.log(token);
      console.log('invoke fetchFromDevice invoked');
      return getDwsConnector().fetchFromDevice(payload, destination, token)
    }).then((response) => {
      console.log('return from getDwsConnector, response:');
      console.log(response);
    }).catch((error) => {
      console.log('error');
      console.log(error);
    });
}
