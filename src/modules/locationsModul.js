const mongoose = require("mongoose");

const { States, Countries, Cities } = require("../models");

module.exports.getAllCities = () =>
new Promise((resolve, reject) => {
  Cities.find({})
    .populate('state', '_id name')
    .then((doc) => {
      resolve(doc);
    })
    .catch((error) => {
      reject(error);
    });
});

module.exports.getAllStates = () =>
  new Promise((resolve, reject) => {
    States.find({})
      .populate('country', '_id name')
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

