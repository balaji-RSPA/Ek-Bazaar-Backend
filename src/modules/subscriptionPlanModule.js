const { SubscriptionPlan } = require("../models");

/**
   * Add subscription plan
*/
module.exports.addSubscriptionPlan = (data) =>
  new Promise((resolve, reject) => {
    SubscriptionPlan.create(data)
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })
/**
   * Edit subscription plan
*/
module.exports.updateSubscriptionPlan = (subscriptionPlanId, data) =>
  new Promise((resolve, reject) => {
    SubscriptionPlan.findOneAndUpdate(
      subscriptionPlanId, {
      $set: data
    }, {
      new: true,
    })
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })
/**
   * Delete subscription plan
*/
module.exports.deleteSubscriptionPlan = (query) =>
  new Promise((resolve, reject) => {
    SubscriptionPlan.findOneAndDelete(query)
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })
/**
   * Get subscription plan
  */
module.exports.getSubscriptionPlanDetail = (query) => new Promise((resolve, reject) => {
  SubscriptionPlan.findOne(query)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})
/**
   * Get All subscription plan
  */
module.exports.getAllSubscriptionPlan = (query, skip, limit) => new Promise((resolve, reject) => {
  SubscriptionPlan.find(query)
    .skip(skip)
    .limit(limit)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})