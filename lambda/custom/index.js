/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const https = require('https');
const request = require('request');

const dwsManager = require('@brightsign/bs-dws-manager');

const bsnConnector = require('@brightsign/bsnconnector');
const bsnGetSession = bsnConnector.bsnGetSession;

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log('invoke getOAuthToken');
    getOAuthToken();

    // console.log('connect to bsn');
    // const session = bsnGetSession();
    // const userName = 'ted@brightsign.biz';
    // const password = 'admin';
    // const network = 'ted';
    // console.log('invoke session.activate');
    // session.activate(userName, password, network).then((result) => {
    //   console.log('session.activate success');
    //   console.log(result);
    //   bsnGetSession().fetchOAuthToken()
    //     .then((token) => {
    //       console.log('fetchOAuthToken success');
    //       console.log(token);
    //     })
    //     .catch((err) => {
    //       console.log('fetchOAuthtoken failure');
    //       console.log(err);
    //     });
    // })
    //   .catch((err) => {
    //     console.log('session activate error');
    //     console.log(err);
    //   });

    // return bsnGetSession().fetchOAuthToken()
    // .then((token: string) => {
    //     getDwsConnector().fetchFromDevice(payload, destination, token)
    // .then((response: any) => {
    //     console.log(response);
    // })
    // .catch((error: any) => {
    //    console.log(error);
    //      });
    // });

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

  var myJSONObject =
  {
    "grant_type": "password",
    "username": "ted@brightsign.biz",
    "password": "P@ssw0rd"
  };
  
// request.get('http://some.server.com/').auth('username', 'password', false);
// // or
// request.get('http://some.server.com/', {
//   'auth': {
//     'user': 'username',
//     'pass': 'password',
//     'sendImmediately': false
//   }
// });

  request({
    url: 'https://oademo.brightsignnetwork.com/v1/token',
    method: "POST",
    auth: {
      'user': '8ybX72Gt',
      'pass': 'oJkARlw1-Ta2G-5WMo-gKJ3-5RxvHpaD5Ngk'
    },
    json: true,
    body: myJSONObject
  }, function (error, response, body){

    console.log('received response, keys are: ');
    console.log(Object.keys(response));

    console.log('response body');
    console.log(response.body);

    // console.log(response.IncomingMessage);
    // console.log(response.IncomingMessage._readableState);
    // console.log(response.IncomingMessage._readableState.ReadableState);

    // console.log('error');
    // console.log(error);
    // console.log('response');
    // console.log(response);


  });

  // const originalOptions = {
  //   host: 'ec2-18-191-89-162.us-east-2.compute.amazonaws.com',
  //   path: '/api/repos/r1639420d605/index?delta=true&clear=false',
  //   port: 8000,
  //   method: 'PUT'
  // };

  // const myOptions = {
  //   host: 'oademo.brightsignnetwork.com',
  //   path: '/v1/token',
  //   method: 'POST',
  //   auth: '8ybX72Gt:oJkARlw1-Ta2G-5WMo-gKJ3-5RxvHpaD5Ngk',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   }
  // };

  // const req = https.request(options, (res) => {
  //   console.log('getOAuthToken Success');
  //   console.log(res);
  // });

  // req.on('error', (e) => {
  //   console.log('getOAuthToken failure')
  //   console.log(e.message);
  // });

  // // send the request
  // req.write('');
  // req.end();
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
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
