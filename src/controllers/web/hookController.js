const mongoose = require("mongoose");
const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const Razorpay = require("razorpay");
const axios = require("axios");
const request = require("request");
const moment = require("moment");
const { ToWords } = require("to-words");
const { capitalizeFirstLetter } = require("../../utils/helpers");
const { fetchRazorpayPayment } = require('../../utils/utils')
const {
    subscriptionPlan,
    sellers,
    Orders,
    OrdersLog,
    Payments,
    SellerPlans,
    SellerPlanLogs,
    category,
    sellerProducts,
    mastercollections,
    InvoiceNumber,
    PaymentData,
    Paylinks,
    subChargedHook,
} = require("../../modules");
const { sendSingleMail } = require("../../utils/mailgunService");
const {
    MailgunKeys,
    razorPayCredentials,
    stripeApiKeys,
    tenderApiBaseUrl,
    tradeApiBaseUrl,
} = require("../../utils/globalConstants");
const stripe = require("stripe")(stripeApiKeys.secretKey);

const { respSuccess, respError } = require("../../utils/respHadler");
const { uploadToDOSpace, sendSMS } = require("../../utils/utils");
const { addOrdersPlans } = require("../../modules/ordersModule");
const {
    planSubscription,
    planChanged,
} = require("../../utils/templates/smsTemplate/smsTemplate");
const {
    invoiceContent,
    planChangedEmail,
    subscriptionPending,
    cancelSubscription,
    paymentLinkGeneration,
} = require("../../utils/templates/emailTemplate/emailTemplateContent");
const {
    commonTemplate,
} = require("../../utils/templates/emailTemplate/emailTemplate");
const { findPincode } = require("../../modules/pincodeModule");

const { getSubscriptionPlanDetail } = subscriptionPlan;

const { getSellerProfile, updateSeller, getUserProfile, getSeller } = sellers;
const { getSellerPlan, createPlan, updateSellerPlan } = SellerPlans;
const { addOrders, updateOrder, getOrderById } = Orders;
const { addOrdersLog, updateOrderLog, addRecurringOrder, updateRecurringOrder } = OrdersLog;
const { addPayment, updatePayment, findPayment } = Payments;
const { createPayLinks, updatePayLinks, findPayLink } = Paylinks;
const { saveSubChargedHookRes, saveSubPendingHookRes, saveSubHaltedHookRes } =
    subChargedHook;
const { addSellerPlanLog } = SellerPlanLogs;
const { getAllSellerTypes } = category;
const { updateSellerProducts } = sellerProducts;
const { updateMasterBulkProducts } = mastercollections;
const { getInvoiceNumber, updateInvoiceNumber, addInvoiceNumber } =
    InvoiceNumber;
const { addPaymentData } = PaymentData;
const isProd = process.env.NODE_ENV === "production";
const toWords = new ToWords();
const crypto = require("crypto");
const { createHmac, Hmac } = crypto;


//Fired by Razorpay when the any Payment got failed while subscription duration.

module.exports.pendingSubWebHook = async (req, res) => {
    try {
        const save = await saveSubPendingHookRes({
            subPendingHookResponse: req.body,
        });
        console.log(
            "🚀 ~ file: paymentController.js ~ line 203 ~ module.exports.pendingSubWebHook= ~ save",
            save
        );
        const { payload } = req.body;
        const { subscription } = payload;
        const { entity } = subscription;
        const subId = entity.id;
        const isTrade = entity.notes.client === "trade";
        const isTender = entity.notes.client === "tender";

        if (isTrade) {
            const paymentQuery = {
                isSubscription: true,
                "paymentResponse.razorpay_subscription_id": subId,
            };

            const responce = await findPayment(paymentQuery);
            console.log(
                "🚀 ~ file: paymentController.js ~ line 302 ~ module.exports.pendingSubWebHook= ~ responce",
                responce
            );

            const sellerDetails =
                responce && responce.orderId && responce.orderId.sellerDetails;
            if (sellerDetails && sellerDetails.email) {
                let subscriptionPendingEmail = subscriptionPending({
                    userName: sellerDetails.name,
                });
                const message = {
                    from: MailgunKeys.senderMail,
                    to: sellerDetails && sellerDetails.email,
                    subject: "Subscription payment failed",
                    html: commonTemplate(subscriptionPendingEmail),
                };
                sendSingleMail(message);
                res.status(200).json({ status: "ok" });
            }
        }
        if (isTender) {
            const url = tenderApiBaseUrl + "/subscriptionPending";
            // const url = 'http://localhost:8060/api/v1/subscriptionPending'
            const response = await axios({
                url,
                method: "POST",
                data: req.body,
            });
            if (response.status === 200) {
                res.status(200).json({ status: "ok" });
            }
        }
    } catch (error) {
        console.log(error, "EEEEEEEEEERRRRRRrrrrrrrrrrrrrrrrrr");
        respError(error);
    }
};

// After all payment try by razorpay is failed, We are cancleing the subscription.

module.exports.subscriptionHalted = async (req, res) => {
    try {
        console.log(req.body, "####################################");
        const save = await saveSubHaltedHookRes({
            subHaltedHookResponse: req.body,
        });
        console.log(
            "🚀 ~ file: paymentController.js ~ line 258 ~ module.exports.subscriptionHalted= ~ save",
            save
        );
        const { payload } = req.body;
        const { subscription } = payload;
        const { entity } = subscription;
        const isTrade = entity.notes.client === "trade";
        const isTender = entity.notes.client === "tender";
        const subId = entity.id;

        if (isTrade) {
            const paymentQuery = {
                isSubscription: true,
                "paymentResponse.razorpay_subscription_id": subId,
            };

            const responce = await findPayment(paymentQuery);
            // console.log("🚀 ~ file: paymentController.js ~ line 391 ~ module.exports.subscriptionHalted= ~ responce", responce.orderId.sellerPlanId)
            const OrderId = responce && responce.orderId && responce.orderId._id;
            const sellerPlanId =
                responce && responce.orderId && responce.orderId.sellerPlanId;
            const ordersQuery = { _id: OrderId };
            const sellerPlanQuery = { _id: sellerPlanId };
            const sellerDetails =
                responce && responce.orderId && responce.orderId.sellerDetails;

            var instance = new Razorpay({
                key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
                key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
            });

            //Making Subscription Cancel Request To Razorpay.
            const rzrResponce = await instance.subscriptions.cancel(subId);
            console.log(
                "🚀 ~ file: paymentController.js ~ line 405 ~ module.exports.subscriptionHalted= ~ rzrResponce",
                sellerDetails
            );

            if (rzrResponce && rzrResponce.status === "cancelled") {
                const OrderUpdate = await updateOrder(ordersQuery, { canceled: true });
                const sellerPlansUpadte = await updateSellerPlan(sellerPlanQuery, {
                    canceled: true,
                });

                if (sellerDetails && sellerDetails.email) {
                    let subscriptionPendingEmail = cancelSubscription({
                        userName: sellerDetails.name,
                    });
                    const message = {
                        from: MailgunKeys.senderMail,
                        to: sellerDetails && sellerDetails.email,
                        subject: "Subscription cancellation",
                        html: commonTemplate(subscriptionPendingEmail),
                    };
                    sendSingleMail(message);
                }
                res.status(200).json({ status: "ok" });
            }
        }

        // If hooks is for Tender
        if (isTender) {
            const url = tenderApiBaseUrl + "/subscriptionHalted";
            const response = await axios({
                url,
                method: "POST",
                data: req.body,
            });

            if (response.status === 200) {
                res.status(200).json({ status: "ok" });
            }
        }

        // respSuccess(res, responce.orderId, "Subscription cancelled")
    } catch (error) {
        console.log(
            "🚀 ~ file: paymentController.js ~ line 334 ~ module.exports.subscriptionHalted= ~ error",
            error
        );
        respError(error);
    }
};

// Every time user get charged we are sending Invoice frome our side.

module.exports.subscriptionCharged = async (req, res) => {
    try {
        const save = await saveSubChargedHookRes({
            subChargedHookResponse: req.body,
        });
        console.log(
            "🚀 ~ file: paymentController.js ~ line 336 ~ module.exports.subscriptionCharged= ~ save",
            save
        );
        const { payload } = req.body;
        const { subscription } = payload;
        console.log(
            "🚀 ~ file: paymentController.js ~ line 342 ~ module.exports.subscriptionCharged= ~ subscription",
            subscription
        );
        const { entity } = subscription;
        const subId = entity.id;
        const isNextPayTerms = entity.paid_count > 1;
        const isTrade = entity.notes.client === "trade";
        console.log(
            "🚀 ~ file: paymentController.js ~ line 343 ~ module.exports.subscriptionCharged= ~ isTrade",
            isTrade
        );
        const isTender = entity.notes.client === "tender";
        console.log(
            "🚀 ~ file: paymentController.js ~ line 345 ~ module.exports.subscriptionCharged= ~ isTender",
            isTender
        );
        const { payment } = payload;

        if (isTrade) {
            if (isNextPayTerms) {
                const paymentQuery = {
                    isSubscription: true,
                    "paymentResponse.razorpay_subscription_id": subId,
                };
                const responce = await findPayment(paymentQuery);
                console.log(
                    "🚀 ~ file: paymentController.js ~ line 354 ~ module.exports.subscriptionCharged= ~ responce",
                    responce
                );
                const sellerId = responce.sellerId;
                let seller = await getSellerProfile(sellerId);
                console.log(
                    "🚀 ~ file: paymentController.js ~ line 357 ~ module.exports.subscriptionCharged= ~ seller",
                    seller
                );
                const order_details = responce.orderId;
                const sellerPlanId = responce.orderId.sellerPlanId;
                const paymentResponse = {
                    razorpay_payment_id: payment.entity.id,
                    razorpay_subscription_id: subId,
                    razorpay_signature:
                        responce &&
                        responce.paymentResponse &&
                        responce.paymentResponse.razorpay_signature,
                };
                const paymentJson = {
                    sellerId: responce.sellerId,
                    userId: responce.userId,
                    paymentDetails: payment.entity,
                    orderId: responce.orderId && responce.orderId._id,
                    paymentResponse,
                    paymentSuccess: true,
                    isSubscription: true,
                };

                const invoiceNumner = await getInvoiceNumber({ id: 1 });
                const _invoice = (invoiceNumner && invoiceNumner.invoiceNumber) || "";

                const paymentResponce = await addPayment(paymentJson);
                console.log(
                    "🚀 ~ file: paymentController.js ~ line 379 ~ module.exports.subscriptionCharged= ~ paymentResponce",
                    paymentResponce
                );

                const sellerPlanDetails = await getSellerPlan({ _id: sellerPlanId });
                console.log(
                    "🚀 ~ file: paymentController.js ~ line 382 ~ module.exports.subscriptionCharged= ~ sellerPlanDetails",
                    sellerPlanDetails
                );

                const months =
                    sellerPlanDetails && sellerPlanDetails.planType === "Quarterly"
                        ? 3
                        : sellerPlanDetails.planType === "Half Yearly"
                            ? 6
                            : sellerPlanDetails.planType === "Yearly"
                                ? 12
                                : "";

                const type = `${sellerPlanDetails.planType}-subscription`;
                const totalPlanPrice = sellerPlanDetails.price / months;
                const exprireDate = new Date(sellerPlanDetails.exprireDate).getTime();
                const planValidFrom = new Date(
                    sellerPlanDetails.planValidFrom
                ).getTime();

                order_details.invoiceNo = _invoice;

                const invoice = await createPdf(
                    seller[0],
                    {
                        ...sellerPlanDetails,
                        totalPlanPrice,
                        type,
                        planValidFrom,
                        exprireDate,
                        next: true,
                    },
                    order_details
                );
                console.log(
                    "🚀 ~ file: paymentController.js ~ line 395 ~ module.exports.subscriptionCharged= ~ invoice",
                    invoice
                );

                await updateInvoiceNumber(
                    { id: 1 },
                    { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
                );

                const sellerDetails = order_details && order_details.sellerDetails;

                if (sellerDetails && sellerDetails.email) {
                    let invoiceEmailMsg = invoiceContent({
                        plan: type,
                        from: planValidFrom,
                        till: exprireDate,
                        price: order_details.total,
                        invoiceLink: invoice.Location,
                        cardNo:
                            payment &&
                            payment.entity &&
                            payment.entity.card &&
                            payment.entity.card.last4,
                        isOneBazzar: false,
                    });
                    const message = {
                        from: MailgunKeys.senderMail,
                        to: sellerDetails.email,
                        subject: "Ekbazaar Subscription activated successfully",
                        html: commonTemplate(invoiceEmailMsg),
                        // attachment: invoice.attachement,
                        attachments: [
                            {
                                // stream as an attachment
                                filename: "invoice.pdf",
                                content: fs.createReadStream(invoice.attachement),
                                // path: invoice.Location,
                            },
                        ],
                    };
                    console.log("---------------Next Payment------------------------");
                    const mailSend = sendSingleMail(message);
                    console.log("-------------Mail Send To User For Next Payment------------", mailSend)

                }
                res.status(200).json({ status: "ok" });
            } else {
                console.log("-----------------First Payment--------------------");
                let query = { "razorPay.id": subId };
                const resive = await findPayLink(query);
                console.log(
                    "🚀 ~ file: paymentController.js ~ line 439 ~ module.exports.subscriptionCharged= ~ test",
                    resive
                );
                if (!resive) {
                    console.log(
                        "--------------Subscription Through Checkout-----------------"
                    );
                    res.status(200).json({ status: "ok" });
                } else {
                    console.log(
                        "--------------Subscription Through Link-----------------"
                    );
                    const paymentResponse = {
                        razorpay_payment_id: payment.entity.id,
                        razorpay_subscription_id: subId,
                    };
                    const {
                        sellerId,
                        subscriptionId,
                        orderDetails,
                        userId,
                        currency,
                        isSubscription,
                        razorPay,
                        isSubLink,
                    } = resive;
                    const { url } = razorPay.notes;

                    const dateNow = new Date();
                    const gstValue = currency === "INR" ? 18 : 0;
                    let deleteProduct = false;
                    const pincode = orderDetails && orderDetails.pincode;
                    let findpincode =
                        currency === "INR" ? await findPincode({ pincode }) : "";
                    if (!findpincode && currency === "INR") {
                        respError(res, "Invalid pincode");
                    } else {
                        let seller = await getSellerProfile(sellerId);
                        const planDetails = await getSubscriptionPlanDetail({
                            _id: subscriptionId,
                        });

                        if (planDetails && seller && seller.length) {
                            seller = seller[0];
                            const checkMobile =
                                seller &&
                                seller.mobile &&
                                seller.mobile.length &&
                                seller.mobile[0] &&
                                seller.mobile[0].mobile;
                            const existingGroup = seller.sellerType[0].group;
                            const currentGroup = planDetails.groupType;
                            let sellerPlanDetails =
                                seller && seller.planId
                                    ? await getSellerPlan({ _id: seller.planId })
                                    : null;
                            const planTo = sellerPlanDetails && sellerPlanDetails.exprireDate;
                            const planFrom = sellerPlanDetails && sellerPlanDetails.createdAt;
                            const checkPaidSeller =
                                sellerPlanDetails && sellerPlanDetails.isTrial === false;
                            const oldPlanType =
                                sellerPlanDetails && sellerPlanDetails.planType;
                            let newPlanType = "";

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

                            if (isSubscription) {
                                price = totalPrice / months;
                            } else {
                                price = totalPrice;
                            }

                            const includedGstAmount = await CalculateGst(
                                price,
                                findpincode,
                                currency
                            );
                            console.log(
                                "🚀 ~ gggggggggggggggggggg  -------",
                                includedGstAmount,
                                req.params.paymentId
                            );

                            const fetchPayment = {
                                method: "GET",
                                url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${payment.entity.id}`,
                            };
                            request(fetchPayment, async function (error, response, body) {
                                try {
                                    console.log("Status:", response.statusCode);
                                    // console.log('Headers:', JSON.stringify(response.headers));
                                    const testbody = JSON.parse(body);
                                    console.log("Response111111111111:", testbody.status);
                                    const userData = {
                                        userId: seller.userId,
                                        sellerId: seller._id,
                                    };
                                    if (
                                        response.statusCode === 200 ||
                                        (response.statusCode === 200 &&
                                            (testbody.status === "authorized" ||
                                                testbody.status === "captured"))
                                    ) {
                                        const invoiceNumner = await getInvoiceNumber({ id: 1 });
                                        const _invoice =
                                            (invoiceNumner && invoiceNumner.invoiceNumber) || "";
                                        let planExpireDate = dateNow.setDate(
                                            dateNow.getDate() + parseInt(planDetails.days)
                                        );
                                        let date = new Date();
                                        // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
                                        const SourceCode =
                                            seller &&
                                            seller.hearingSource &&
                                            seller.hearingSource.referralCode;
                                        let isFreeTrialIncluded = false;
                                        let planValidFrom = moment();

                                        if (
                                            seller &&
                                            seller.hearingSource &&
                                            seller.hearingSource.source === "Uttarakhand" &&
                                            seller.hearingSource.referralCode === "UTK1121"
                                        ) {
                                            if (seller && seller.planId && seller.planId.isTrial) {
                                                const trialCreatedAt =
                                                    seller.planId && seller.planId.createdAt;
                                                const today = moment();
                                                const daysFromRegistration = today.diff(
                                                    moment(trialCreatedAt, "DD-MM-YYYY"),
                                                    "days"
                                                );
                                                const todayDate = new Date();
                                                if (daysFromRegistration <= 7) {
                                                    planExpireDate = todayDate.setDate(
                                                        todayDate.getDate() +
                                                        parseInt(planDetails.days) +
                                                        parseInt(seller.planId.days) -
                                                        daysFromRegistration
                                                    );

                                                    planDetails.days = `${parseInt(planDetails.days) +
                                                        parseInt(seller.planId.days) -
                                                        daysFromRegistration
                                                        }`;

                                                    isFreeTrialIncluded = true;

                                                    planValidFrom = moment(seller.planId.exprireDate);
                                                }
                                            }
                                        }

                                        await updateInvoiceNumber(
                                            { id: 1 },
                                            {
                                                invoiceNumber:
                                                    parseInt(invoiceNumner.invoiceNumber) + 1,
                                            }
                                        );

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
                                            paymentSuccess: true,
                                            isSubscription,
                                        };
                                        const _p_details = {
                                            subscriptionId: planDetails._id,
                                            expireStatus: false,
                                            name: planDetails.type,
                                            price: planDetails.price,
                                            usdPrice: planDetails.usdPrice,
                                            description: planDetails.description,
                                            features: planDetails.features,
                                            days: planDetails.days,
                                            extendTimes: null,
                                            exprireDate: planExpireDate,
                                            // subscriptionValidety,
                                            hearingSourceCode: SourceCode,
                                            isTrial: false,
                                            planType: planDetails.type,
                                            extendDays: planDetails.days,
                                            groupType: planDetails.groupType,
                                            billingType: planDetails.billingType,
                                            priceUnit: planDetails.priceUnit,
                                            type: planDetails.type,
                                            currency,
                                        };
                                        const payment = await addPayment(paymentJson);
                                        const planData = {
                                            ...userData,
                                            ..._p_details,
                                            isFreeTrialIncluded,
                                            planValidFrom,
                                            isSubscription,
                                            canceled: false,
                                            createdAt: new Date(),
                                            createdOn: new Date(),
                                        };

                                        const order_details = {
                                            ...userData,
                                            invoiceNo: _invoice,
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
                                            ipAddress:
                                                (orderDetails && orderDetails.ipAddress) || null,
                                            currency: currency,
                                            isSubscription,
                                            // isEmailSent: ''
                                        };

                                        const OrdersData = await addOrders(order_details);
                                        const orderItem = {
                                            ...userData,
                                            orderId: OrdersData._id,
                                            subscriptionId: planDetails._id,
                                            ..._p_details,
                                            isFreeTrialIncluded,
                                            planValidFrom,
                                            isSubscription,
                                        };

                                        const orderItemData = await addOrdersPlans(orderItem);
                                        let sellerUpdate = {
                                            paidSeller: true,
                                            sellerVerified: true,
                                            isSubscription,
                                        };

                                        console.log(
                                            existingGroup,
                                            "!==",
                                            currentGroup,
                                            " Group equality check------"
                                        );
                                        if (existingGroup !== currentGroup) {
                                            const sellerType = await getAllSellerTypes(0, 10, {
                                                group: parseInt(currentGroup),
                                            });
                                            const typeSeller = sellerType.map((item) => item._id);
                                            sellerUpdate = {
                                                ...sellerUpdate,
                                                sellerType: typeSeller,
                                            };
                                            deleteProduct = true;
                                        }
                                        const patmentUpdate = await updatePayment(
                                            { _id: payment._id },
                                            { orderId: OrdersData._id }
                                        );
                                        if (sellerPlanDetails) {
                                            sellerPlanDetails = await updateSellerPlan(
                                                { _id: sellerPlanDetails._id },
                                                planData
                                            );
                                        } else {
                                            sellerPlanDetails = await createPlan(planData);
                                            sellerUpdate.planId = sellerPlanDetails._id;
                                        }
                                        const sellerUpdateData = await updateSeller(
                                            { _id: seller._id },
                                            sellerUpdate
                                        );
                                        const planLog = {
                                            ...userData,
                                            sellerPlanId: sellerPlanDetails._id,
                                            subscriptionId: planDetails._id,
                                            sellerDetails: { ...sellerDetails },
                                            planDetails: {
                                                ..._p_details,
                                                exprireDate: new Date(_p_details.exprireDate),
                                            },
                                            isSubscription,
                                        };
                                        const OrderUpdate = await updateOrder(
                                            { _id: OrdersData._id },
                                            {
                                                orderPlanId: orderItemData._id,
                                                paymentId: payment._id,
                                                planId: sellerPlanDetails._id,
                                                sellerPlanId: sellerPlanDetails._id,
                                            }
                                        );
                                        // Generate invoice
                                        const invoice = await createPdf(
                                            seller,
                                            {
                                                ..._p_details,
                                                totalPlanPrice: price,
                                                totalPrice,
                                                isFreeTrialIncluded,
                                                planValidFrom,
                                            },
                                            order_details
                                        );
                                        await addSellerPlanLog(planLog);
                                        if (
                                            deleteProduct === true &&
                                            seller.sellerProductId &&
                                            seller.sellerProductId.length
                                        ) {
                                            updateSellerProducts(
                                                { _id: { $in: seller.sellerProductId } },
                                                { isDeleted: true }
                                            );
                                            updateMasterBulkProducts(
                                                { _id: { $in: seller.sellerProductId } },
                                                { isDeleted: true }
                                            );
                                            console.log(
                                                "--- Old Service Type Product Status changed-------"
                                            );
                                            // update product deleta status true
                                        }
                                        if (
                                            deleteProduct === false &&
                                            seller.sellerProductId &&
                                            seller.sellerProductId.length
                                        ) {
                                            updateMasterBulkProducts(
                                                {
                                                    _id: {
                                                        $in: seller.sellerProductId,
                                                    },
                                                },
                                                { priority: 1 }
                                            );
                                            console.log("--- Old product priority changed-------");
                                            // update product deleta status true
                                        }

                                        if (
                                            currency === "INR" &&
                                            checkMobile &&
                                            isProd &&
                                            planTo &&
                                            planFrom &&
                                            checkPaidSeller
                                        ) {
                                            const msgData = {
                                                plan: _p_details.planType,
                                                currency: currency,
                                                amount: includedGstAmount.totalAmount,
                                                url: invoice.Location,
                                                name:
                                                    order_details.invoiceNo.toString() + "-invoice.pdf",
                                                till: _p_details.exprireDate,
                                                to: planTo,
                                                from: planFrom,
                                            };
                      /* await */ sendSMS(checkMobile, planChanged(msgData));
                                        } else if (currency === "INR" && checkMobile && isProd) {
                                            const msgData = {
                                                plan: _p_details.planType,
                                                currency: currency,
                                                amount: includedGstAmount.totalAmount,
                                                url: (invoice && invoice.Location) || null,
                                                name:
                                                    order_details.invoiceNo.toString() + "-invoice.pdf",
                                                till: _p_details.exprireDate,
                                            };
                      /* await */ sendSMS(
                                                checkMobile,
                                                planSubscription(msgData)
                                            );
                                        } else {
                                            console.log("================sms not send===========");
                                        }
                                        if (
                                            orderDetails &&
                                            orderDetails.email /* seller && seller.email */ &&
                                            planTo &&
                                            planFrom &&
                                            checkPaidSeller
                                        ) {
                                            let planChangedEmailMsg = planChangedEmail({
                                                oldPlanType,
                                                newPlanType: _p_details.planType,
                                                from:
                                                    isFreeTrialIncluded && planValidFrom
                                                        ? planValidFrom
                                                        : new Date(),
                                                till: _p_details.exprireDate,
                                                // till: _p_details.subscriptionValidety,
                                                url,
                                            });
                                            const message = {
                                                from: MailgunKeys.senderMail,
                                                to:
                                                    (orderDetails && orderDetails.email) || seller.email,
                                                subject: "Plan changed",
                                                html: commonTemplate(planChangedEmailMsg),
                                            };
                      /* await */ sendSingleMail(message);
                                        } else {
                                            console.log(
                                                "==============Plan Changed Email Not Send===================="
                                            );
                                        }
                                        if (orderDetails && orderDetails.email) {
                                            let invoiceEmailMsg = invoiceContent({
                                                plan: _p_details.planType,
                                                from:
                                                    isFreeTrialIncluded && planValidFrom
                                                        ? planValidFrom
                                                        : new Date(),
                                                till: _p_details.exprireDate,
                                                price: includedGstAmount.totalAmount,
                                                invoiceLink: invoice.Location,
                                                cardNo:
                                                    paymentJson.paymentDetails &&
                                                    paymentJson.paymentDetails.card &&
                                                    paymentJson.paymentDetails.card.last4,
                                                isOneBazzar: false,
                                            });
                                            const message = {
                                                from: MailgunKeys.senderMail,
                                                to: orderDetails.email || seller.email,
                                                subject: "Ekbazaar Subscription activated successfully",
                                                html: commonTemplate(invoiceEmailMsg),
                                                // attachment: invoice.attachement,
                                                attachments: [
                                                    {
                                                        // stream as an attachment
                                                        filename: "invoice.pdf",
                                                        content: fs.createReadStream(invoice.attachement),
                                                        // path: invoice.Location,
                                                    },
                                                ],
                                            };
                      /* await */ sendSingleMail(message);
                                        } else {
                                            console.log(
                                                "==============Invoice Not Send===================="
                                            );
                                        }
                                        await updateOrder(
                                            { _id: OrdersData._id },
                                            {
                                                isEmailSent: true,
                                                invoicePath: (invoice && invoice.Location) || "",
                                            }
                                        );
                                        console.log("------------------ Payment done ---------");
                                        // return respSuccess(res, { payment: true }, 'subscription activated successfully!')
                                    } else {
                                        console.log("-------  Payment Failled -------------");
                                        const paymentJson = {
                                            ...userData,
                                            paymentResponse: paymentResponse,
                                            paymentDetails: JSON.parse(body),
                                            paymentSuccess: false,
                                            isSubscription
                                        };
                                        const payment = await addPayment(paymentJson);
                                        // return respSuccess(res, { payment: false }, 'Payment failed')
                                    }
                                } catch (error) {
                                    console.log(error, "tttttttt");
                                }
                            });
                        } else {
                            console.log(planDetails, "TTTTTTTTTTTTTTTTT");
                            // return respSuccess(res, { payment: false }, 'Payment failed')
                        }
                    }
                }
                res.status(200).json({ status: "ok" });
            }
        }

        if (isTender) {
            const url = tenderApiBaseUrl + "/subscriptionCharged";
            const response = await axios({
                url,
                method: "POST",
                data: req.body,
            });
            if (response.status === 200) {
                res.status(200).json({ status: "ok" });
            }
        }
    } catch (error) {
        console.log(error);
        respError(error);
    }
};

module.exports.paymentCaptured = async (req, res) => {
    try {
        console.log(
            "🚀 ~ file: paymentController.js ~ line 618 ~ module.exports.paymentCaptured= ~ req",
            req.body
        );

        res.status(200).json({ status: "ok" });
    } catch (error) {
        console.log(error);
    }
};