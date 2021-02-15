
module.exports.emailSuccessfulRegistration = (params) => {
  let message = {
    title : 'Welcome',
    image: '/images/registrationthanks.png',
    body: 'You have successfully registered and your account has been activated with a 30 days free trial for Trade Bazaar.',
    greeting:`Hello, ${params.name}`,
    buttonName: 'LOGIN TO YOUR ACCOUNT',
    buttonLink:'google.com'
  }
  return message;
}