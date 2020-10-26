const mongoose = require("mongoose");

const { States, Countries } = require("../models");
// const States = require("../models/statesSchema");

module.exports.getAllStates = () =>
  new Promise((resolve, reject) => {
    States.find({})
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.getAllCountries = () =>
  new Promise((resolve, reject) => {
    Countries.find({})
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.addState = (newData) =>
  new Promise((resolve, reject) => {
    States.create(newData)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error.message));
  });

module.exports.addCountry = (newData) =>
  new Promise((resolve, reject) => {
    Countries.create(newData)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
