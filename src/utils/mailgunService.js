const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const {
MailgunKeys
} = require("./globalConstants");

module.exports.sendSingleMail = (email, message) => new Promise((resolve, reject) => {
  try {
    message.from = MailgunKeys.senderMail;
    message.to = email
    message["h:Reply-To"] = MailgunKeys.replyMail;
    const auth = {
      auth: {
        api_key: MailgunKeys.mailgunAPIKey,
        domain: MailgunKeys.mailgunDomain,
      },
      // proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
    };
    const nodemailerMailgun = nodemailer.createTransport(mg(auth));
    nodemailerMailgun.sendMail(message, (err, info) => {
      if (err) {
        console.log(`Error: ${err}`);
        reject(err)
      } else {
        console.log(`Response: ${info}`);
        resolve(info)
      }
    });
  } catch (error) {
    reject(error)
  }
});

module.exports.sendBulkMails = (message) => {
  try {
    // console.log(message, ":::::>>>>>>>>>");
    message.from = senderMail;
    message["h:Reply-To"] = replyMail;
    const auth = {
      auth: {
        api_key: mailgunAPIKey,
        domain: mailgunDomain,
      },
      // proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
    };
    const nodemailerMailgun = nodemailer.createTransport(mg(auth));
    nodemailerMailgun.sendMail(message, (err, info) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        console.log(`Response: ${info}`);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}


module.exports.emailTemplate = (message) => {
  try {
    const email_template =
      `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Ek Bazaar</title>
            </head>
            <body>
              ` +
      message +
      `
            </body>
            </html>`;
    return email_template;;
  } catch (error) {
    console.error(error.message);
  }
};