// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
let date = require('date-and-time');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
var connector = new builder.ChatConnector({
    appId:'358cdc96-272b-40ee-8c89-073da6d4f635',
    appPassword: 'kvixkJMG2[)*aiWBOB6501('
});
server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Welcome to pizza ordering bot");
    session.beginDialog("OrderPizza");
});

var luisAppUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/eafd1e94-89c3-4d89-9dff-918a3c0d79bd?subscription-key=137d934f7aea4f45a2216f250237285a&verbose=true&timezoneOffset=0&q=';

bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

bot.dialog("OrderPizza",[
  function(session,args,next){
    var intent=args.intent;
    console.log("intent",intent);
    var pizzakind=builder.EntityRecognizer.findEntity(intent.entities,'pizzaKind');
    console.log("pizzakind : ",pizzakind);
    var quantity=builder.EntityRecognizer.parseNumber(intent.entities,'number');
    console.log("quantity : ",quantity);
    var date=builder.EntityRecognizer.findEntity(intent.entities,'builtin.datetimeV2.date');
    console.log("date : ",date);
    console.log(intent);
    var order= session.dialogData.order ={
      pizzakind: pizzakind ? pizzakind.entity : null,
      quantity: quantity ? quantity : null,
      date : date ? date.resolution.values[0] : null
    }
    console.log(order.pizzakind);
    console.log(order.quantity);
    console.log(order.date);
    var obj =order.date;
    if(obj){
      var result = Object.keys(obj).map(function(key) {
        return [ obj[key]];
      });
      console.log(result[2]);
    }
if(order.pizzakind && order.quantity && order.date ){
  session.send(`Order confirmed. Order details: <br/>Type: ${order.pizzakind} <br/>quantity: ${order.quantity} <br/> date:${result[2]} `);
  session.endDialog();
}
    if(!order.pizzakind){
      builder.Prompts.text(session,"sure, what type of pizza would you want me to order?");
    }else{
      next();
    }

  },
  function(session,results,next){
    var order = session.dialogData.order
            if (results.response) {
              var array=["veg","chicken","cheese","double cheese","margarita","panner","fresh pan pizza"];
              if(array.indexOf(results.response)!=-1){
                order.pizzakind=results.response;
              }
              else{
                session.send("Enter valid reply");
              }
  }

  if(!order.quantity){
    builder.Prompts.text(session,"how many of them would you like to order?");
  }
  else {
    {
      next();
    }
  }
},
function(session,results,next){
  var order = session.dialogData.order;
          if (results.response) {
            if (isNaN(results.response)) {
               session.send("Enter Valid reply");
}
else{
  order.quantity=results.response;
}
}

if(!order.date){
  builder.Prompts.time(session,"when do you prefer your order to be delivered?");
}
else {
    next();
}
},
function(session,results){
  var order = session.dialogData.order;
  if (results.response){
    session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
    //order.date=session.dialogData.time;
       order.date=date.format(session.dialogData.time, 'MM/DD/YYYY');
  }
  session.send(`Order confirmed. Order details: <br/>Type: ${order.pizzakind} <br/>quantity: ${order.quantity} <br/> date:${order.date} `);
  session.endDialog();

}
]).triggerAction({
    matches: 'PizzaOrdering',
    confirmPrompt: "This will cancel the ordering. Are you sure?"
}).cancelAction('cancelpizza', "pizza order canceled.", {
    matches: /^(cancel|nevermind)/i,
    confirmPrompt: "Are you sure?"
});
