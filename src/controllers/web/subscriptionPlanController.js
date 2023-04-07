const { respSuccess, respError } = require("../../utils/respHadler");
const { subscriptionPlan, sellers, SellerPlans, Orders } = require("../../modules");
const {
    getAllSubscriptionPlan,
    getSubscriptionPlanDetail,
} = subscriptionPlan;

const {
  createTrialPlan,
  getAboutToexpirePlan,
  getExpirePlans
} = SellerPlans

const {
    checkSellerExist,
    updateSeller
} = sellers
const {
    getOrders,
    getOrdersCount
} = Orders


/**
 * Get all subscription plan
 */
module.exports.getAllSubscriptionPlan = async(req, res) => {
    try {
        const { skip, limit } = req.body
        // console.log(req.query,"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        const subscriptionPlan = await getAllSubscriptionPlan(req.query || {}, skip, limit);
        respSuccess(res, subscriptionPlan);
    } catch (error) {
        respError(res, error.message);
    }
};

module.exports.acticateTrialPlan = async(req, res) => {
    try {
        const { sellerId } = req.body
        const dateNow = new Date();
        const seller = await checkSellerExist({ _id: sellerId })
        if (seller) {

            const trialPlan = await getSubscriptionPlanDetail({ planType: "trail", status: true })
            if (trialPlan) {
                const planData = {
                    name: trialPlan.type,
                    description: trialPlan.description,
                    features: trialPlan.features,
                    days: trialPlan.days,
                    extendTimes: trialPlan.numberOfExtends,
                    exprireDate: dateNow.setDate(dateNow.getDate() + parseInt(trialPlan.days)),
                    userId: seller.userId,
                    sellerId: seller._id,
                    isTrial: true,
                    planType: trialPlan.type,
                    extendDays: trialPlan.days
                }
                console.log(planData)
                const planResult = await createTrialPlan(planData)
                console.log(planResult, 'planResult........................')
                const planDatra = {
                    planId: planResult._id,
                    trialExtends: trialPlan.numberOfExtends,
                }
                const sellerUpdate = await updateSeller({ _id: seller._id }, planDatra);

                respSuccess(res, 'Trial Plan Activated Successfully');
            } else {
                respSuccess(res, 'Please contact to support');
            }

        } else {
            respSuccess(res, "Seller Not Exist");
        }


    } catch (error) {
        console.log(error)
        respError(res, error.message);
    }
};
module.exports.getAboutToexpire = async(req,res)=>{
  try{
    const result = await getAboutToexpirePlan();
    respSuccess(res, result, 'Notification for about to expire');
  }catch(err){
   respSuccess(res, "Something went wrong");
  }
}
module.exports.getExpiredPlan = async (req, res) => {
  try {
    const result = await getExpirePlans();
    respSuccess(res, result, 'Notification for expired plan');
  } catch (err) {
    respSuccess(res, "Something went wrong");
  }
}
module.exports.getSellerOrders = async(req, res) => {
    try {
        console.log(req.params, req.query, 'orders')
        const {
            skip,
            limit,
            userId,
            sellerId
        } = req.query
        const result = await getOrders({
            userId
        }, {
            skip,
            limit
        })
        const ordersCount = await getOrdersCount({ userId })
        // console.log("module.exports.getSellerOrders -> result", result, ordersCount)
            // const result = await getAboutToexpirePlan();
        return respSuccess(res, {
            data: result,
            totalCount: ordersCount
        });
    } catch (err) {
        console.log(err)
        respError(err);
    }
}