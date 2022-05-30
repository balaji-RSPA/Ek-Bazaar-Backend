const Razorpay = require("razorpay");
const { OrdersLog, Payments, sellers, subscriptionPlan, Orders } = require("../modules");
const { findPincode } = require("../modules/pincodeModule");
const { addOrdersLog, addPendingSubscriptionOrders, updatePendingSubscriptionOrders } = OrdersLog;
const { addOrders } = Orders
const { addPayment } = Payments;
const { getSellerProfile } = sellers
const { getSubscriptionPlanDetail } = subscriptionPlan;
const request = require("request");
const { respSuccess, respError } = require("../utils/respHadler");
const { razorPayCredentials } = require('../utils/globalConstants')

async function CalculateGst(price, findPinCode, currency) {
    const gstValue = 18;
    const cgst = 9;
    let gstAmount = "";
    let cgstAmount = "";
    let sgstAmount = "";
    let totalAmount = "";
    if (currency === "INR") {
        if (findPinCode.stateName === "Karnataka") {
            console.log("karnataka");
            cgstAmount = (parseFloat(price) * cgst) / 100;
            sgstAmount = (parseFloat(price) * cgst) / 100;
            totalAmount = parseFloat(price) + cgstAmount + sgstAmount;
        } else {
            console.log("non karnataka");
            gstAmount = (parseFloat(price) * gstValue) / 100;
            totalAmount = parseFloat(price) + gstAmount;
        }
    } else {
        totalAmount = parseFloat(price) + 0.0;
    }
    return { gstAmount, cgstAmount, sgstAmount, totalAmount };
}

const createPendingOrder = async (userId, sellerId, paymentId, subscriptionId, orderDetails, currency, isSubscription, paymentResponse) => new Promise(async (resolve,reject)=> {
    const userData = {
        userId: userId,
        sellerId: sellerId,
    };
    const fetchPayment = {
        method: "GET",
        url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${paymentId}`,
    };
    let seller = await getSellerProfile(sellerId);
    const planDetails = await getSubscriptionPlanDetail({
        _id: subscriptionId,
    });

    const pincode = orderDetails && orderDetails.pincode;
    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";

    const months =
        planDetails && planDetails.type === "Quarterly"
            ? 3
            : planDetails.type === "Half Yearly"
                ? 6
                : planDetails.type === "Yearly"
                    ? 12
                    : "";
    const totalPrice =
        planDetails &&
        (currency === "INR" ? planDetails.price : planDetails.usdPrice);
    const gstValue = currency === "INR" ? 18 : 0;
    let price = totalPrice / months;
    const includedGstAmount = await CalculateGst(
        price,
        findpincode,
        currency
    );
    if (planDetails && seller && seller.length ) {
        seller = seller[0];
        const SourceCode =
            seller && seller.hearingSource && seller.hearingSource.referralCode;
        request(fetchPayment, async function (error, response, body) {
            const sellerDetails = {
                name: orderDetails.name,
                email: orderDetails.email || seller.email,
                sellerType: seller.sellerType,
                groupId: planDetails.groupType,
                location: seller.location,
                mobile: seller.mobile,
            };
            const paymentJson = {
                ...userData,
                paymentResponse: paymentResponse,
                paymentDetails: JSON.parse(body),
                paymentSuccess: false,
                isSubscription,
            };
            const order_details = {
                ...userData,
                invoiceNo: "",
                invoicePath: "",
                gstNo: (orderDetails && orderDetails.gst) || null,
                address: (orderDetails && orderDetails.address) || null,
                pincode: (orderDetails && orderDetails.pincode) || null,
                country: (orderDetails && orderDetails.country) || null,
                sellerDetails: {
                    ...sellerDetails,
                },
                // sellerPlanId: '', // seller plan collectio id
                subscriptionId: subscriptionId,
                // orderPlanId: '', // order items/plans id
                gst: gstValue,
                price: price,
                gstAmount: includedGstAmount.gstAmount,
                cgstAmount: includedGstAmount.cgstAmount,
                sgstAmount: includedGstAmount.sgstAmount,
                total: includedGstAmount.totalAmount,
                orderedOn: new Date(),
                hearingSourceCode: SourceCode,
                // paymentId: '', // payment collection id
                // paymentStatus: '',
                ipAddress: (orderDetails && orderDetails.ipAddress) || null,
                currency: currency,
                status:false,
                orderStatus:'pending',
                recurringId:null,
                isSubscription,
                // isEmailSent: ''
            };
            const payment = await addPayment(paymentJson);
            // console.log("🚀 ~ file: paymentAuth.js ~ line 122 ~ payment", payment)
            const OrdersData = await addOrders(order_details);
            // console.log("🚀 ~ file: paymentAuth.js ~ line 124 ~ OrdersData", OrdersData)
            if (payment && OrdersData) {
                let data = {
                    OrderId: OrdersData._id,
                    PaymentId: payment._id
                }
                resolve({ pendingOrderCreated: true, data })
            }   
        })
    }
})

exports.subscriptionPaymentAuth = async (req, res, next) => {
    const {
        sellerId,
        subscriptionId,
        orderDetails,
        userId,
        paymentResponse,
        currency,
        isSubscription,
        paymentId,
        verifyId
    } = req.body;

    const data = {
        sellerId,
        subscriptionId,
        orderDetails,
        userId,
        paymentResponse,
        currency,
        isSubscription,
        rzrPaymentId: paymentId,
        rzrSubscriptionId: verifyId,
        status: false
    }

    const responce = await addOrdersLog(data)

    // var instance = new Razorpay({
    //     key_id: razorPayCredentials.key_id, 
    //     key_secret: razorPayCredentials.key_secret, 
    // })

    // instance.payments.edit(paymentId, {
    //     "notes": {
    //         client: "trade",
    //         url: req.get("origin")
    //     }
    // })

    let verify = paymentResponse.razorpay_payment_id + "|" + verifyId;
    let crypto = require("crypto");
    let expectedSignature = crypto
        .createHmac("sha256", razorPayCredentials.key_secret)
        .update(verify.toString())
        .digest("hex");
    if (expectedSignature === paymentResponse.razorpay_signature) {
        next()
    } else {
        const pendingSubData = {
            sellerId,
            subscriptionId,
            orderDetails,
            userId,
            paymentResponse,
            currency,
            isSubscription,
            rzrPaymentId: paymentId,
            rzrSubscriptionId: verifyId,
            pending: true
        }
        const savedPending = await addPendingSubscriptionOrders(pendingSubData);
        console.log("🚀 ~ file: paymentAuth.js ~ line 179 ~ exports.subscriptionPaymentAuth= ~ savedPending", savedPending)
        
        if (savedPending) {
            const createdPending = await createPendingOrder(userId, sellerId, paymentId, subscriptionId, orderDetails, currency, isSubscription, paymentResponse)

            if (createdPending && createdPending.pendingOrderCreated) {
                const { data } = createdPending,
                query = { _id: savedPending._id}

                const pendingTable = await updatePendingSubscriptionOrders(query, data);

                return respSuccess(
                    res,
                    { payment: false, recall: true },
                    "Your Payment is in Pending State, Our Team is working On it, ThankYou For Your patience"
                );
            }
        }

    }


}
