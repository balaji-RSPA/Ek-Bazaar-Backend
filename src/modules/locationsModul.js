const mongoose = require('mongoose');

const { States, Countries } = require('../models')

module.exports.getAllStates = () =>  new Promise ((resolve, reject) => {

    States.find({}).then((doc) => {

        resolve(doc)

    }).catch(error => {

        reject(error)

    })
})