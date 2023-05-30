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
  tradeSiteUrl
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

const { getSellerProfile, updateSeller, getUserProfile, getSeller, getUserData, getSellerAllDetails } = sellers;
const { getSellerPlan, createPlan, updateSellerPlan } = SellerPlans;
const { addOrders, updateOrder, getOrderById, updateOrderPlan } = Orders;
const { addOrdersLog, updateOrderLog, addRecurringOrder, updateRecurringOrder, getRecurringOrder, getPendingSubscriptionOrders, updatePendingSubscriptionOrders } = OrdersLog;
const { addPayment, updatePayment, findPayment } = Payments;
const { createPayLinks, updatePayLinks, findPayLink, createStripPayLinks, updateStripPayLinks, findStripPayLink } = Paylinks;
const { saveSubChargedHookRes, saveSubPendingHookRes, saveSubHaltedHookRes, getSubChargedHook, getSubPendingHook, updateSubPendingHook, getSubHaltedHook, updateSubHaltedHook, saveSubCancledHookRes, getSubCancledHook, updateSubCancledHook, saveCancledPaymentHookRes, getCancledPaymentHook, updateCancledPaymentHook } = subChargedHook;
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

const createPdf = async (seller, plan, orderDetails) =>
  new Promise((resolve, reject) => {
    try {
      console.log(seller, plan, orderDetails, "$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      const sellerDetails = {
        name:
          (orderDetails &&
            orderDetails.sellerDetails &&
            capitalizeFirstLetter(orderDetails.sellerDetails.name)) ||
          seller.name,
        businessname:
          (seller &&
            seller.busenessId &&
            capitalizeFirstLetter(seller.busenessId.name)) ||
          "",
        city:
          (seller &&
            seller.location &&
            seller.location.city &&
            capitalizeFirstLetter(seller.location.city.name)) ||
          "",
        state:
          (seller &&
            seller.location &&
            seller.location.city &&
            capitalizeFirstLetter(seller.location.state.name)) ||
          "",
        country:
          (seller &&
            seller.location &&
            seller.location.country &&
            capitalizeFirstLetter(seller.location.country.name)) ||
          "",
        showGst:
          seller &&
            seller.sellerType &&
            seller.sellerType.length &&
            seller.sellerType[0]["name"] === "farmer"
            ? false
            : true,
        gstLable:
          seller &&
            seller.sellerType &&
            seller.sellerType.length &&
            seller.sellerType[0]["name"] === "farmer"
            ? "Aadhar Number"
            : "GSTIN",
        gstNo: (orderDetails && orderDetails.gstNo) || "",
        address: (orderDetails && orderDetails.address) || "",
        pincode: (orderDetails && orderDetails.pincode) || "",
      };
      const orderData = {
        planType: (plan && plan.type) || "",
        pricePerMonth: (plan && plan.price) || "",
        // months: '3',
        features: plan && plan.features,
        igstAmount: orderDetails && orderDetails.gstAmount,
        cgstAmount: orderDetails && orderDetails.cgstAmount,
        sgstAmount: orderDetails && orderDetails.sgstAmount,

        amount: plan && plan.totalPlanPrice,
        orderTotal: orderDetails && orderDetails.total.toFixed(2),
        invoiceDate: moment(new Date()).format("DD/MM/YYYY"),
        startDate:
          plan && plan.isFreeTrialIncluded && plan.planValidFrom
            ? plan && moment(plan.planValidFrom).format("DD/MM/YYYY")
            : plan.next
              ? moment(new Date(plan.planValidFrom)).format("DD/MM/YYYY")
              : moment(new Date()).format("DD/MM/YYYY"),
        expireDate:
          plan && moment(new Date(plan.exprireDate)).format("DD/MM/YYYY"),
        // subscriptionValidety: plan && moment(new Date(plan.subscriptionValidety)).format('DD/MM/YYYY'),
        invoiceNumber: (orderDetails && orderDetails.invoiceNo) || "",
        // currency: orderDetails && orderDetails.currency || '',
        currency:
          orderDetails && orderDetails.currency === "INR" ? "₹" : "$" || "",
        currencyInWords:
          orderDetails && orderDetails.currency === "INR"
            ? `${toWords.convert(
              orderDetails && orderDetails.total /* , { currency: true } */
            )} Rupees Only`
            : `${toWords.convert(
              orderDetails && orderDetails.total /* , { currency: true } */
            )} Dollars Only`,
        country: (orderDetails && orderDetails.country) || "",
        currencyFlag:
          orderDetails && orderDetails.currency === "INR" ? true : "",
      };
      /* const html = fs.readFileSync(path.resolve(__dirname, '../../..', 'src/utils/templates/invoice', 'invoiceTemplate.html'), 'utf8'); */
      let html;
      if (orderDetails && orderDetails.currency === "INR") {
        html = fs.readFileSync(
          path.resolve(
            __dirname,
            "../../..",
            "src/utils/templates/invoice",
            "invoiceTemplateNew.html"
          ),
          "utf8"
        );
      } else {
        html = fs.readFileSync(
          path.resolve(
            __dirname,
            "../../..",
            "src/utils/templates/invoice",
            "invoiceTemplateOnebazaarNew.html"
          ),
          "utf8"
        );
      }
      const options = {
        format: "A4",
        // orientation: "portrait",
        border: "10mm",
        // header: {
        //     // height: "45mm",
        //     contents: '<div style="text-align: center;">Ekbazaar</div>'
        // },
        // "footer": {
        //     // "height": "28mm",
        //     "contents": {
        //         // first: 'Cover page',
        //         2: 'Second page', // Any page number is working. 1-based index
        //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        //         // last: 'Last Page'
        //     }
        // }
      };

      const details = {
        orderData: { ...orderData },
        sellerDetails: { ...sellerDetails },
      };

      console.log(orderDetails, "orderDetailsorderDetails1111111111111");

      const invoiceFileName =
        orderDetails && orderDetails.invoiceNo.toString() + "-invoice.pdf";

      console.log(invoiceFileName, "invoiceFileName");

      const document = {
        html: html,
        data: {
          details: details,
        },
        path: path.resolve(
          __dirname,
          "../../../",
          "public/orders",
          invoiceFileName
        ),
      };
      pdf
        .create(document, options)
        .then(async (res) => {
          console.log(res);
          const output = `invoice-${orderDetails && orderDetails.invoiceNo
            }.pdf`;
          const invoice = fs.readFileSync(res.filename);
          let data = {
            Key: `${seller._id}/${orderDetails && orderDetails.invoiceNo
              }/${output}`,
            body: invoice,
          };
          const multidoc = await uploadToDOSpace(data);
          console.log(multidoc, "((((((((((((((((((((((((((((((((((((((((((")
          resolve({
            ...multidoc,
            attachement: path.resolve(
              __dirname,
              "../../../",
              "public/orders",
              invoiceFileName
            ),
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.log(error);
      respError(error);
    }
  });

const assignOurPlan = async (data, body, url, updatePending) => new Promise(async (resolve, reject) => {
  try {
    const {
      sellerId,
      subscriptionId,
      orderDetails,
      userId,
      paymentResponse,
      currency,
      isSubscription,
    } = data;

    if (updatePending) {
      console.log(sellerId, "#########$$$$$$$$$$$$$$%%%%%%%%%%%%%%%!!!!!!!!!!!!!!!!")
      var { update, OrderId, PaymentId } = updatePending;
    }
    const dateNow = new Date();
    const gstValue = currency === "INR" ? 18 : 0;
    //  currency = 'INR'
    let deleteProduct = false;
    const pincode = orderDetails && orderDetails.pincode;
    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";

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
      const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
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

      let price;
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
      // console.log(
      //   "🚀 ~ gggggggggggggggggggg  -------",
      //   includedGstAmount,
      //   paymentId
      // );

      const userData = {
        userId: seller.userId,
        sellerId: seller._id,
      };

      const invoiceNumner = await getInvoiceNumber({ id: 1 });
      const _invoice = (invoiceNumner && invoiceNumner.invoiceNumber) || "";
      let planExpireDate = dateNow.setDate(
        dateNow.getDate() + parseInt(planDetails.days)
      );
      let date = new Date();
      // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
      const SourceCode =
        seller && seller.hearingSource && seller.hearingSource.referralCode;
      let isFreeTrialIncluded = false;
      let planValidFrom = moment();

      if (
        seller &&
        seller.hearingSource &&
        seller.hearingSource.source === "Uttarakhand" &&
        seller.hearingSource.referralCode === "UTK1121"
      ) {
        if (seller && seller.planId && seller.planId.isTrial) {
          const trialCreatedAt = seller.planId && seller.planId.createdAt;
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
        { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
      );



      const sellerDetails = {
        name: orderDetails.name,
        email: orderDetails.email || seller.email,
        sellerType: seller.sellerType,
        groupId: planDetails.groupType,
        location: seller.location,
        mobile: seller.mobile,
      };
      let paymentJson;
      let payment;

      if (updatePending && update) {
        const paymentQuery = { _id: PaymentId }
        payment = await updatePayment(paymentQuery, { paymentSuccess: true });
        paymentJson = payment;
      } else {
        paymentJson = {
          ...userData,
          paymentResponse: paymentResponse,
          paymentDetails: JSON.parse(body),
          paymentSuccess: true,
          isSubscription,
        };
        payment = await addPayment(paymentJson);
      }

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

      console.log("🚀 ~ file: paymentController.js ~ line 426 ~ assignOurPlan ~ payment111111111111111", payment)
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
      let order_details;
      let OrdersData;
      if (updatePending && update) {
        const ordersQuery = { _id: OrderId }
        let result = await getOrderById(ordersQuery);
        result = await updateOrder(ordersQuery, { invoiceNo: _invoice })
        order_details = result;
        OrdersData = result;
      }
      else {
        order_details = {
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
          ipAddress: (orderDetails && orderDetails.ipAddress) || null,
          currency: currency,
          isSubscription,
          // isEmailSent: ''
        };
        OrdersData = await addOrders(order_details);
      }
      console.log("🚀 ~ file: paymentController.js ~ line 468 ~ assignOurPlan ~ OrdersData222222222222222222", OrdersData)

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
      console.log("🚀 ~ file: paymentController.js ~ line 480 ~ assignOurPlan ~ orderItemData3333333333333", orderItemData)
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
        console.log("🚀 ~ file: paymentController.js ~ line 496 ~ assignOurPlan ~ sellerType44444444444444", sellerType)
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
      console.log("🚀 ~ file: paymentController.js ~ line 508 ~ assignOurPlan ~ patmentUpdate5555555555555", patmentUpdate)
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
      console.log("🚀 ~ file: paymentController.js ~ line 555 ~ assignOurPlan ~ invoice", invoice)
      let recurringResponce;
      if (isSubscription) {
        const fromDate = moment();
        let next_date = moment(fromDate, "YYYY-MM-DD").add(1, 'months');
        let firstPaymentDate = moment(new Date()).format("DD/MM/YYYY")
        const recurringDate = {
          userId,
          sellerId,
          sellerPlanId: sellerPlanDetails._id,
          invoiceNo: [_invoice],
          invoicePath: [(invoice && invoice.Location) || ""],
          paymentDateLog: [firstPaymentDate],
          nextPaymentDate: next_date
        }
        recurringResponce = await addRecurringOrder(recurringDate)
        console.log(recurringResponce, "######################$$$$$$$$$$$$$$$$$");
      }

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
        console.log("--- Old Service Type Product Status changed-------");
        // update product deleta status true
      }

      if (
        deleteProduct === false &&
        seller.sellerProductId &&
        seller.sellerProductId.length
      ) {
        updateMasterBulkProducts(
          { _id: { $in: seller.sellerProductId } },
          { priority: 1 }
        );
        console.log("--- Old product priority changed-------");
        // update product deleta status true
      }

      // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
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
          name: order_details.invoiceNo.toString() + "-invoice.pdf",
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
          name: order_details.invoiceNo.toString() + "-invoice.pdf",
          till: _p_details.exprireDate,
        };
      /* await */ sendSMS(checkMobile, planSubscription(msgData));
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
          from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
          till: _p_details.exprireDate,
          // till: _p_details.subscriptionValidety,
          url,
        });
        const message = {
          from: MailgunKeys.senderMail,
          to: (orderDetails && orderDetails.email) || seller.email,
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
          from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
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
        console.log("==============Invoice Not Send====================");
      }
      await updateOrder(
        { _id: OrdersData._id },
        { isEmailSent: true, invoicePath: (invoice && invoice.Location) || "", orderStatus: 'success', recurringId: recurringResponce._id }
      );
      console.log("------------------ Payment done ---------");
      resolve({ status: "ok" });
    }

  } catch (error) {
    console.log(error);
  }
})

async function CalculateGst(price, findPinCode, currency) {
  const gstValue = 18;
  const cgst = 9;
  let gstAmount = "";
  let cgstAmount = "";
  let sgstAmount = "";
  let totalAmount = "";
  if (currency === "INR") {
    if (!findPinCode) {
      gstAmount = (parseFloat(price) * gstValue) / 100;
      totalAmount = parseFloat(price) + gstAmount;
    }
    else if (findPinCode.stateName === "Karnataka") {
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

//Fired by Razorpay when the any Payment got failed while subscription duration.

module.exports.pendingSubWebHook = async (req, res) => {
  try {
    const check = await getSubPendingHook({ uniqueEventId: req.headers['x-razorpay-event-id'] })
    let save;
    if (check && check.length) {
      res.status(200).json({ status: "ok" });
    } else {
      save = await saveSubPendingHookRes({
        subPendingHookResponse: req.body,
        uniqueEventId: req.headers['x-razorpay-event-id'],
        oprated: false
      });
      if (save) {
        res.status(200).json({ status: "ok" });
      }
    }

    console.log(
      "🚀 ~ file: paymentController.js ~ line 203 ~ module.exports.pendingSubWebHook= ~ save",
      save
    );
    const { payload } = save.subPendingHookResponse;
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
        // res.status(200).json({ status: "ok" });
      }
      const update = await updateSubPendingHook({ _id: save._id }, { oprated: true })
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
        // res.status(200).json({ status: "ok" });
        console.log("Responce Came From Tender For pending_Subscription_webhook")
      }
    }
  } catch (error) {
    console.log(error, "EEEEEEEEEERRRRRRrrrrrrrrrrrrrrrrrr");
    // respError(error);
  }
};

// After all payment try by razorpay is failed, We are cancleing the subscription.

module.exports.subscriptionHalted = async (req, res) => {
  try {
    const check = await getSubHaltedHook({ uniqueEventId: req.headers['x-razorpay-event-id'] })
    let save;
    if (check && check.length) {
      res.status(200).json({ status: "ok" });
      return
    } else {
      save = await saveSubHaltedHookRes({
        subHaltedHookResponse: req.body,
        uniqueEventId: req.headers['x-razorpay-event-id'],
        oprated: false
      });
      if (save) {
        res.status(200).json({ status: "ok" });
      }
    }

    console.log(
      "🚀 ~ file: paymentController.js ~ line 258 ~ module.exports.subscriptionHalted= ~ save",
      save
    );
    const { payload } = save.subHaltedHookResponse;
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

        // if (sellerDetails && sellerDetails.email) {
        //   let subscriptionPendingEmail = cancelSubscription({
        //     userName: sellerDetails.name,
        //   });
        //   const message = {
        //     from: MailgunKeys.senderMail,
        //     to: sellerDetails && sellerDetails.email,
        //     subject: "Subscription cancellation",
        //     html: commonTemplate(subscriptionPendingEmail),
        //   };
        //   sendSingleMail(message);
        // }
        // res.status(200).json({ status: "ok" });

        const update = await updateSubHaltedHook({ _id: save._id }, { oprated: true })
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
        // res.status(200).json({ status: "ok" });
        console.log("Responce Came From Tender For halted_Subscription_webhook")
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
    const check = await getSubChargedHook({ uniqueEventId: req.headers['x-razorpay-event-id'] })
    let save;
    if (check && check.length) {
      res.status(200).json({ status: "ok" });
      return
    } else {
      save = await saveSubChargedHookRes({
        subChargedHookResponse: req.body,
        uniqueEventId: req.headers['x-razorpay-event-id'],
        oprated: false
      });
      if (save) {
        res.status(200).json({ status: "ok" });
      }
    }

    const { payload } = save.subChargedHookResponse;
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
        // console.log(
        //   "🚀 ~ file: paymentController.js ~ line 357 ~ module.exports.subscriptionCharged= ~ seller",
        //   seller
        // );
        const recurringId = responce && responce.orderId && responce.orderId.recurringId;
        let recurringData;
        let invoiceNoArr;
        let invoicePathArr;
        let paymentDateLogArr;
        let nextPaymentDate;
        let newDate;
        if (recurringId) {
          recurringData = await getRecurringOrder({ _id: recurringId })
          console.log("🚀 ~ file: paymentController.js ~ line 979 ~ module.exports.subscriptionCharged= ~ recurringData", recurringData)
          invoiceNoArr = recurringData && recurringData.invoiceNo;
          console.log("🚀 ~ file: paymentController.js ~ line 983 ~ module.exports.subscriptionCharged= ~ invoiceNoArr", invoiceNoArr)
          invoicePathArr = recurringData && recurringData.invoicePath;
          console.log("🚀 ~ file: paymentController.js ~ line 985 ~ module.exports.subscriptionCharged= ~ invoicePathArr", invoicePathArr)
          nextPaymentDate = recurringData && recurringData.nextPaymentDate;
          newDate = moment(nextPaymentDate, "YYYY-MM-DD").add(1, 'months');
          paymentDateLogArr = recurringData && recurringData.paymentDateLog
        }
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
        await updateInvoiceNumber(
          { id: 1 },
          { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
        );

        const paymentResponce = await addPayment(paymentJson);
        // console.log(
        //   "🚀 ~ file: paymentController.js ~ line 379 ~ module.exports.subscriptionCharged= ~ paymentResponce",
        //   paymentResponce
        // );

        const sellerPlanDetails = await getSellerPlan({ _id: sellerPlanId });
        // console.log(
        //   "🚀 ~ file: paymentController.js ~ line 382 ~ module.exports.subscriptionCharged= ~ sellerPlanDetails",
        //   sellerPlanDetails
        // );

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
        // console.log(
        //   "🚀 ~ file: paymentController.js ~ line 395 ~ module.exports.subscriptionCharged= ~ invoice",
        //   invoice
        // );



        if (recurringId) {
          invoiceNoArr.push(_invoice);
          invoicePathArr.push(invoice.Location)
          let nextPaymentLogDate = moment(new Date()).format("DD/MM/YYYY")
          paymentDateLogArr.push(nextPaymentLogDate)

          await updateRecurringOrder({ _id: recurringId }, {
            invoiceNo: invoiceNoArr,
            invoicePath: invoicePathArr,
            paymentDateLog: paymentDateLogArr,
            nextPaymentDate: newDate
          })
        }




        // invoiceNoArr.push(_invoice);
        // invoicePathArr.push(invoice.Location)
        // let nextPaymentLogDate = moment(new Date()).format("DD/MM/YYYY")
        // paymentDateLogArr.push(nextPaymentLogDate)

        // await updateRecurringOrder({ _id: recurringId }, {
        //   invoiceNo: invoiceNoArr,
        //   invoicePath: invoicePathArr,
        //   paymentDateLog: paymentDateLogArr,
        //   nextPaymentDate: newDate
        // })



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
        // res.status(200).json({ status: "ok" });
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
          let pendingQuery = { pending: true, rzrSubscriptionId: subId }

          let pendingSub = await getPendingSubscriptionOrders(pendingQuery)

          if (pendingSub && pendingSub.length) {
            console.log(
              pendingSub, "pendingSub-------------- Pending Subscription Through Checkout-----------------"
            );
            const { userId, subscriptionId, orderDetails, currency, isSubscription, OrderId, PaymentId, sellerId, paymentResponse } = pendingSub[0];

            const data = {
              sellerId,
              subscriptionId,
              orderDetails,
              userId,
              paymentResponse,
              currency,
              isSubscription,
            }
            const { url } = entity.notes;
            const isAssigned = await assignOurPlan(data, JSON.stringify(payment && payment.entity), url, { update: true, OrderId, PaymentId });

            if (isAssigned && isAssigned.status === "ok") {
              const updatePending = await updatePendingSubscriptionOrders(pendingQuery, { pending: false })
              console.log("---------Pending Subscription Assingned Successfully-----------------")
            }
          } else {
            console.log(
              "--------------SucessFull Subscription Through Checkout-----------------"
            );
          }
          // res.status(200).json({ status: "ok" });
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
            // respError(res, "Invalid pincode");
            console.log("Invalid pincode")
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
              // console.log(
              //   "🚀 ~ gggggggggggggggggggg  -------",
              //   includedGstAmount,
              //   req.params.paymentId
              // );

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
                    console.log(invoice, "))))))))))))))))))))))))))))))0")
                    let recurringResponce;
                    if (isSubscription) {
                      const fromDate = moment();
                      let next_date = moment(fromDate, "YYYY-MM-DD").add(1, 'months');
                      let firstPaymentDate = moment(new Date()).format("DD/MM/YYYY")
                      const recurringDate = {
                        userId,
                        sellerId,
                        sellerPlanId: sellerPlanDetails._id,
                        invoiceNo: [_invoice],
                        invoicePath: [(invoice && invoice.Location) || ""],
                        paymentDateLog: [firstPaymentDate],
                        nextPaymentDate: next_date
                      }
                      recurringResponce = await addRecurringOrder(recurringDate)
                    }
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
                        orderStatus: 'success', recurringId: recurringResponce._id
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
        // res.status(200).json({ status: "ok" });
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
        // res.status(200).json({ status: "ok" });
      }
    }
  } catch (error) {
    console.log("🚀 ~ file: paymentController.js ~ line 1725 ~ module.exports.subscriptionCharged= ~ error", error)
    // respError(error);
  }
};

module.exports.paymentFailedHook = async (req, res) => {
  try {
    const iswhatsapp = req.body.payload.payment.entity.notes.iswhatsapp
    const sellerId=req.body.payload.payment.entity.notes.sellerId
    const check = await getCancledPaymentHook({ uniqueEventId: req.headers['x-razorpay-event-id'] })
    let save;
    if (check && check.length) {
      res.status(200).json({ status: "ok" });
      return
    } else {
      save = await saveCancledPaymentHookRes({
        paymentFailedHookResponse: req.body,
        uniqueEventId: req.headers['x-razorpay-event-id'],
        oprated: false
      });
      if (iswhatsapp) {
        const url = "https://app.chat360.io/api/ekbazaar/payment/status"
        const fres = req.body
        const data = {
          sellerId,
          userId: null,
          paymentSuccess: false,
          currency: fres.payload.payment.entity.currency,
          amount: fres.payload.payment.entity.amount,
          payment_id: fres.payload.payment.entity.id,
          source: "ekbazaar",
          order_id: fres.payload.payment.entity.order_id,
          status: fres.payload.payment.entity.status,
          captured: fres.payload.payment.entity.captured,
          error_code: fres.payload.payment.entity.error_code,
          error_description: fres.payload.payment.entity.error_description,
          invoice: null
        }
        console.log(url, data, "Before sending fail data to whats app=================--------------");
        await sendDatatoWhatsapp(url, data)
      }

      if (save) {
        res.status(200).json({ status: "ok" });
      }

    }
    console.log("🚀 ~ file: paymentController.js ~ line 1741 ~ module.exports.paymentFailedHook= ~ save", save)

    const { payload } = save.paymentFailedHookResponse;
    const { payment } = payload;
    const { entity } = payment;

    const payId = entity && entity.id;

    let pendingQuery = { pending: true, rzrPaymentId: payId }

    let pendingSub = await getPendingSubscriptionOrders(pendingQuery)

    if (pendingSub && pendingSub.length) {
      const { userId, subscriptionId, orderDetails, currency, isSubscription, OrderId, PaymentId, sellerId, paymentResponse } = pendingSub[0];

      const ordersQuery = { _id: OrderId }

      let result = await updateOrder(ordersQuery, { orderStatus: "failed" })

      if (result) {
        const updatePending = await updatePendingSubscriptionOrders(pendingQuery, { pending: false })
        console.log("---------Payment Failed Now Order Status is Failed -----------------")
      }

    } else {

      // Request will Go to tender.
      const url = tenderApiBaseUrl + "/paymentFailedHook";
      const response = await axios({
        url,
        method: "POST",
        data: req.body,
      });
      if (response.status === 200) {
        // res.status(200).json({ status: "ok" });
      }
    }

  } catch (error) {
    console.log("🚀 ~ file: paymentController.js ~ line 1733 ~ module.exports.paymentFailedHook= ~ error", error)

  }
}

module.exports.subscriptionCancleHook = async (req, res) => {
  try {
    const check = await getSubCancledHook({ uniqueEventId: req.headers['x-razorpay-event-id'] })
    let save;
    if (check && check.length) {
      res.status(200).json({ status: "ok" });
      return
    } else {
      save = await saveSubCancledHookRes({
        subCancledHookResponse: req.body,
        uniqueEventId: req.headers['x-razorpay-event-id'],
        oprated: false
      });
      if (save) {
        res.status(200).json({ status: "ok" });
      }

      const { payload } = save.subCancledHookResponse;
      const { subscription } = payload;
      const { entity } = subscription;
      const isTrade = entity.notes.client === "trade";
      const isTender = entity.notes.client === "tender";
      const subId = entity.id;

      const paidCount = entity && entity.paid_count;
      if (isTrade) {
        const paymentQuery = {
          isSubscription: true,
          "paymentResponse.razorpay_subscription_id": subId,
        };

        const responce = await findPayment(paymentQuery);

        const OrderId = responce && responce.orderId && responce.orderId._id;
        const sellerPlanId =
          responce && responce.orderId && responce.orderId.sellerPlanId;
        const ordersQuery = { _id: OrderId };
        const sellerPlanQuery = { _id: sellerPlanId };
        const sellerDetails =
          responce && responce.orderId && responce.orderId.sellerDetails;

        const sellerPlanDetails = await getSellerPlan(sellerPlanQuery);

        const planFrom = sellerPlanDetails && sellerPlanDetails.planValidFrom;
        const exprireDate = sellerPlanDetails && sellerPlanDetails.exprireDate;

        let new_expery_date = moment(planFrom, "YYYY-MM-DD").add(paidCount, 'months');

        const OrderUpdate = await updateOrder(ordersQuery, { canceled: true });
        const sellerPlansUpadte = await updateSellerPlan(sellerPlanQuery, {
          canceled: true,
          exprireDate: new_expery_date
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

        const update = await updateSubCancledHook({ _id: save._id }, { oprated: true })
        console.log("🚀 ~ file: paymentController.js ~ line 1689 ~ module.exports.subscriptionCancleHook= ~ update", update)
      }

      if (isTender) {
        // Request will Go to tender.
        const url = tenderApiBaseUrl + "/subscriptionCancled";
        const response = await axios({
          url,
          method: "POST",
          data: req.body,
        });
        if (response.status === 200) {
          // res.status(200).json({ status: "ok" });
        }
      }

    }
  } catch (error) {
    console.log("🚀 ~ file: paymentController.js ~ line 1650 ~ module.exports.subscriptionCancleHook= ~ error", error)
  }
}

module.exports.cancleSubscription = async (req, res) => {
  try {
    const { OrderId } = req.body;
    const ordersQuery = { _id: OrderId };
    const result = await getOrderById(ordersQuery);
    const raz_sub_id =
      result &&
      result.paymentId &&
      result.paymentId.paymentResponse &&
      result.paymentId.paymentResponse.razorpay_subscription_id;
    const sellerPlanQuery = { _id: result.sellerPlanId };

    var instance = new Razorpay({
      key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
      key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
    });

    //Making Subscription Cancel Request To Razorpay.
    const rzrResponce = await instance.subscriptions.cancel(raz_sub_id);
    console.log(
      "🚀 ~ file: paymentController.js ~ line 644 ~ module.exports.cancleSubscription= ~ rzrResponce",
      rzrResponce,
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
    );

    if (rzrResponce && rzrResponce.status === "cancelled") {
      const OrderUpdate = await updateOrder(ordersQuery, { canceled: true });
      const sellerPlansUpadte = await updateSellerPlan(sellerPlanQuery, {
        canceled: true,
      });

      respSuccess(res, rzrResponce, "Subscription cancelled");
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

module.exports.createRazorPayLink = async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
      key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
    });
    const {
      planId,
      currency,
      isSubscription,
      sellerId,
      userId,
      orderDetails,
      isSubLink,
    } = req.body;
    console.log(
      "🚀 ~ file: paymentController.js ~ line 507 ~ module.exports.createRazorPayLink= ~ isSubLink",
      JSON.stringify(req.body)
    );
    const { pincode, name, email, mobile } = orderDetails;

    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";
    if (!findpincode && currency === "INR") {
      respError(res, "Invalid pincode");
    } else {
      const planDetails = await getSubscriptionPlanDetail({ _id: planId });
      console.log(
        "🚀 ~ file: paymentController.js ~ line 678 ~ module.exports.createRazorPayLink= ~ planDetails",
        planDetails
      );
      console.log(
        "🚀 ~ file: paymentController.js ~ line 678 ~ module.exports.createRazorPayLink= ~ planId",
        planId
      );

      if (planDetails) {
        const gstValue = 18;
        const months =
          planDetails && planDetails.type === "Quarterly"
            ? 3
            : planDetails.type === "Half Yearly"
              ? 6
              : planDetails.type === "Yearly"
                ? 12
                : "";
        const price =
          planDetails &&
          (currency === "INR" ? planDetails.price : planDetails.usdPrice);
        const includedGstAmount = await CalculateGst(
          price,
          findpincode,
          currency
        );

        // Create the link-payment Document
        const data = {
          sellerId,
          userId,
          isSubscription,
          currency,
          orderDetails,
          isSubLink,
          subscriptionId: planId,
          razorPay: {},
        };
        const mob =
          orderDetails && orderDetails.mobile && orderDetails.mobile.mobile,
          mail = orderDetails && orderDetails.email;
        const response = await createPayLinks(data);
        const query = { _id: response._id };
        let result;
        if (isSubscription && isSubLink) {
          let plan_id = planDetails && planDetails.plan_id;
          result = await instance.subscriptions.create({
            plan_id,
            total_count: parseInt(months),
            customer_notify: 1,
            notes: {
              client: "trade",
              planId,
              url: req.get("origin"),
              sellerId,
              userId,
              isSubLink
            },
            notify_info: {
              notify_phone: `${mob}`,
              notify_email: mail,
            },
          });
          console.log(result, "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        } else {
          result = await instance.paymentLink.create({
            // upi_link: true,
            amount: parseInt((includedGstAmount.totalAmount * 100).toFixed(2)),
            currency: currency,
            accept_partial: false,
            description: planDetails.description,
            reference_id: response._id,
            customer: {
              name: name,
              email: email,
              contact: mobile.mobile,
            },
            notify: {
              sms: true,
              email: false,
            },
            notes: {
              client: "trade",
              url: req.get("origin"),
            },
            callback_url: tradeApiBaseUrl + "captureLinkPayment",
            callback_method: "get",
          });
        }
        const update = await updatePayLinks(query, { razorPay: result });
        if (update && update.orderDetails && update.orderDetails.email) {
          let payLinkEmailMsg = paymentLinkGeneration({
            userName: name,
            payLink: result.short_url,
          });
          const message = {
            from: MailgunKeys.senderMail,
            to: email,
            subject: "Payment link",
            html: commonTemplate(payLinkEmailMsg),
          };
          sendSingleMail(message);

          respSuccess(res, { ...result }, "Link Send to Your Email");
        }
      }
    }
  } catch (error) {
    console.log(error);
    respError(error);
  }
};

module.exports.createWhatsappPaymentLink = async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
      key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
    });

    let { sellerId, planId, pinCode, mobile } = req.body;

    let currency = "INR";
    let isSubscription = false

    if (!sellerId) {
      return respError(res, "Seller ID is required for the payment link!")
    }

    if (!planId) {
      return respError(res, "Plan ID is required for the payment link!")
    }

    let sellerDetails = await getSellerProfile(sellerId);
    let seller = sellerDetails && sellerDetails[0];

    if (!seller) {
      return respError(res, "Seller ID is not valid!")
    }
    if (seller && seller.isPartialyRegistor) {
      return respError(res, "Please complete your profile first")
    }

    const planDetails = await getSubscriptionPlanDetail({
      _id: planId,
    });

    if (!planDetails) {
      return respError(res, "Plan ID is not valid!")
    }

    let pin = pinCode || (seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.pincode);

    if (!pin) {
      return respError(res, "Pin code is required!")
    }

    delete seller.mobile[0]._id

    const trialExp = new Date(seller && seller.planId && seller.planId.exprireDate)
    const dateNow = new Date();
    const trialCreatedAt = seller.planId && seller.planId.createdAt;
    const today = moment();
    const daysFromRegistration = today.diff(moment(trialCreatedAt, 'YYYY-MM-DD'), 'days');

    // console.log(planDetails.price, planDetails.gst, "BBBBBBBBBBB", planDetails)

    let gstPercent = planDetails.gst || 18;

    let orderDetails = {
      name: seller && seller.name || '',
      email: seller && seller.email || '',
      mobile: seller && seller.mobile[0] || {},
      gst: seller && seller.statutoryId && seller.statutoryId.GstNumber && seller.statutoryId.GstNumber.number || '',
      address: seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.address || '',
      pincode: pin,
      planName: planDetails && planDetails.type,
      groupType: planDetails && planDetails.groupType === 1 ? "Manufacturers/Traders" : planDetails.groupType === 2 ? 'Farmer' : 'Service' || '',
      validityFrom: seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller && seller.planId && seller.planId.isTrial && daysFromRegistration <= 7 ? moment(trialExp).format('DD/MM/YYYY') : moment(dateNow).format('DD/MM/YYYY'),
      validityTill: seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller && seller.planId && seller.planId.isTrial && daysFromRegistration <= 7
        ? moment(trialExp.setDate(trialExp.getDate() + parseInt(planDetails.days))).format('DD/MM/YYYY')
        : moment(dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))).format('DD/MM/YYYY') || '',
      price: planDetails && planDetails.price || '',
      gstAmount: planDetails && (planDetails.price * gstPercent) / 100,
      isSubscription: false,
      ipAddress: ""
    }

    const data = {
      sellerId,
      userId: seller.userId,
      isSubscription,
      currency,
      orderDetails,
      isSubLink: false,
      subscriptionId: planId,
      razorPay: {},
    };

    let findpincode = currency === "INR" ? await findPincode({ pincode: pin }) : "";
    // console.log(pin,"🚀 ~ file: paymentController.js:2184 ~ module.exports.createWhatsappPaymentLink= ~ findpincode:", findpincode)

    if (!findpincode) {
      return respError(res, "Pin code is not valid!");
    } else {

      const price =
        planDetails &&
        (currency === "INR" ? planDetails.price : planDetails.usdPrice);
      const includedGstAmount = await CalculateGst(
        price,
        findpincode,
        currency
      );

      const mob =
        orderDetails && orderDetails.mobile && orderDetails.mobile.mobile,
        mail = orderDetails && orderDetails.email;
      const response = await createPayLinks(data);
      // console.log("🚀 ~ file: paymentController.js:2208 ~ module.exports.createWhatsappPaymentLink= ~ response:", response)

      const query = { _id: response._id };
      // let timeStamp = Date.now();
      let timeStamp = Math.round(+new Date() / 1000);
      let expireTime = timeStamp + (16 * 60);
      console.log(timeStamp, "🚀 ~ file: paymentController.js:2212 ~ module.exports.createWhatsappPaymentLink= ~ expireTime:", expireTime)

      let result = await instance.paymentLink.create({
        // upi_link: true,
        amount: parseInt((includedGstAmount.totalAmount * 100).toFixed(2)),
        currency: currency,
        accept_partial: false,
        description: planDetails.description,
        reference_id: response._id,
        customer: {
          name: orderDetails.name,
          email: mail,
          contact: mob,
        },
        expire_by: expireTime,
        notify: {
          sms: true,
          email: true,
        },
        notes: {
          client: "trade",
          url: tradeSiteUrl,
          iswhatsapp: true,
          sellerId
        },
        callback_url: tradeApiBaseUrl + "captureLinkPayment?iswhatsapp=true",
        callback_method: "get",
      });
      console.log("🚀 ~ file: paymentController.js:2239 ~ module.exports.createWhatsappPaymentLink= ~ result:", result)

      const update = await updatePayLinks(query, { razorPay: result });
      // console.log("🚀 ~ file: paymentController.js:2236 ~ module.exports.createWhatsappPaymentLink= ~ update:", update)
      if (update && update.orderDetails && update.orderDetails.email) {
        let payLinkEmailMsg = paymentLinkGeneration({
          userName: seller.name,
          payLink: result.short_url,
        });
        const message = {
          from: MailgunKeys.senderMail,
          to: mail,
          subject: "Payment link",
          html: commonTemplate(payLinkEmailMsg),
        };
        sendSingleMail(message);

        respSuccess(res, { payLink: result.short_url }, "Payment link is generated. Link is valid only for 15 minutes.");

      }
    }


    // res.json({ result })

  } catch (error) {
    console.log("🚀 ~ file: paymentController.js:2106 ~ module.exports.createWhatsappPaymentLink= ~ error:", error)
    respError(res, { error: error.message }, "Internal Server Error")
  }
}

module.exports.captureLink = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
      iswhatsapp
    } = req.query;

    const resive = await findPayLink({
      _id: razorpay_payment_link_reference_id,
    });
    console.log(
      "🚀 ~ file: paymentController.js ~ line 752 ~ module.exports.captureLink= ~ resive",
      resive
    );

    const payLinkId = resive && resive.razorPay && resive.razorPay.id;
    let bodyTest =
      payLinkId +
      "|" +
      resive._id +
      "|" +
      razorpay_payment_link_status +
      "|" +
      razorpay_payment_id;

    let crypto = require("crypto");
    let expectedSignature = crypto
      .createHmac("sha256", razorPayCredentials.key_secret)
      .update(bodyTest.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const paymentResponse = req.query;
      const {
        sellerId,
        subscriptionId,
        orderDetails,
        userId,
        currency,
        isSubscription,
        razorPay,
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
          const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
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
            url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${razorpay_payment_id}`,
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
                const result = await assignPlantoUser(
                  planDetails,
                  seller,
                  orderDetails,
                  userData,
                  paymentResponse,
                  body,
                  isSubscription,
                  currency,
                  subscriptionId,
                  gstValue,
                  price,
                  includedGstAmount,
                  existingGroup,
                  currentGroup,
                  sellerPlanDetails,
                  totalPrice,
                  deleteProduct,
                  checkMobile,
                  planTo,
                  planFrom,
                  checkPaidSeller,
                  oldPlanType,
                  url,
                  dateNow,
                  iswhatsapp
                );
                if (result && result.status === "ok") {
                  // return respSuccess(
                  //   res,
                  //   { payment: true },
                  //   "subscription activated successfully!"
                  // );
                  return res.redirect(301, tradeSiteUrl)
                  // return res.location(301, 'https://tradebazaar.tech-active.com/')
                }
                //         const invoiceNumner = await getInvoiceNumber({ id: 1 })
                //         const _invoice = invoiceNumner && invoiceNumner.invoiceNumber || ''
                //         let planExpireDate = dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))
                //         let date = new Date()
                //         // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
                //         const SourceCode = seller && seller.hearingSource && seller.hearingSource.referralCode;
                //         let isFreeTrialIncluded = false;
                //         let planValidFrom = moment()

                //         if (seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller.hearingSource.referralCode === 'UTK1121') {
                //             if (seller && seller.planId && seller.planId.isTrial) {
                //                 const trialCreatedAt = seller.planId && seller.planId.createdAt;
                //                 const today = moment();
                //                 const daysFromRegistration = today.diff(moment(trialCreatedAt, 'DD-MM-YYYY'), 'days');
                //                 const todayDate = new Date();
                //                 if (daysFromRegistration <= 7) {
                //                     planExpireDate = todayDate.setDate(todayDate.getDate() + parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration)

                //                     planDetails.days = `${parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration}`

                //                     isFreeTrialIncluded = true

                //                     planValidFrom = moment(seller.planId.exprireDate)
                //                 }
                //             }
                //         }

                //         await updateInvoiceNumber({ id: 1 }, { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 })

                //         const sellerDetails = {
                //             name: orderDetails.name,
                //             email: orderDetails.email || seller.email,
                //             sellerType: seller.sellerType,
                //             groupId: planDetails.groupType,
                //             location: seller.location,
                //             mobile: seller.mobile
                //         }
                //         const paymentJson = {
                //             ...userData,
                //             paymentResponse: paymentResponse,
                //             paymentDetails: JSON.parse(body),
                //             paymentSuccess: true,
                //             isSubscription
                //         }
                //         const _p_details = {
                //             subscriptionId: planDetails._id,
                //             expireStatus: false,
                //             name: planDetails.type,
                //             price: planDetails.price,
                //             usdPrice: planDetails.usdPrice,
                //             description: planDetails.description,
                //             features: planDetails.features,
                //             days: planDetails.days,
                //             extendTimes: null,
                //             exprireDate: planExpireDate,
                //             // subscriptionValidety,
                //             hearingSourceCode: SourceCode,
                //             isTrial: false,
                //             planType: planDetails.type,
                //             extendDays: planDetails.days,
                //             groupType: planDetails.groupType,
                //             billingType: planDetails.billingType,
                //             priceUnit: planDetails.priceUnit,
                //             type: planDetails.type,
                //             currency
                //         }
                //         const payment = await addPayment(paymentJson)
                //         const planData = {
                //             ...userData,
                //             ..._p_details,
                //             isFreeTrialIncluded,
                //             planValidFrom,
                //             isSubscription,
                //             canceled: false,
                //             createdAt: new Date(),
                //             createdOn: new Date()
                //         }

                //         const order_details = {
                //             ...userData,
                //             invoiceNo: _invoice,
                //             invoicePath: '',
                //             gstNo: orderDetails && orderDetails.gst || null,
                //             address: orderDetails && orderDetails.address || null,
                //             pincode: orderDetails && orderDetails.pincode || null,
                //             country: orderDetails && orderDetails.country || null,
                //             sellerDetails: {
                //                 ...sellerDetails
                //             },
                //             // sellerPlanId: '', // seller plan collectio id
                //             subscriptionId: subscriptionId,
                //             // orderPlanId: '', // order items/plans id
                //             gst: gstValue,
                //             price: price,
                //             gstAmount: includedGstAmount.gstAmount,
                //             cgstAmount: includedGstAmount.cgstAmount,
                //             sgstAmount: includedGstAmount.sgstAmount,
                //             total: includedGstAmount.totalAmount,
                //             orderedOn: new Date(),
                //             hearingSourceCode: SourceCode,
                //             // paymentId: '', // payment collection id
                //             // paymentStatus: '',
                //             ipAddress: orderDetails && orderDetails.ipAddress || null,
                //             currency: currency,
                //             isSubscription
                //             // isEmailSent: ''
                //         }

                //         const OrdersData = await addOrders(order_details)
                //         const orderItem = {
                //             ...userData,
                //             orderId: OrdersData._id,
                //             subscriptionId: planDetails._id,
                //             ..._p_details,
                //             isFreeTrialIncluded,
                //             planValidFrom,
                //             isSubscription
                //         }

                //         const orderItemData = await addOrdersPlans(orderItem)
                //         let sellerUpdate = {
                //             paidSeller: true,
                //             sellerVerified: true,
                //             isSubscription
                //         }

                //         console.log(existingGroup, '!==', currentGroup, ' Group equality check------')
                //         if (existingGroup !== currentGroup) {
                //             const sellerType = await getAllSellerTypes(0, 10, { group: parseInt(currentGroup) })
                //             const typeSeller = sellerType.map((item) => item._id)
                //             sellerUpdate = {
                //                 ...sellerUpdate,
                //                 sellerType: typeSeller
                //             }
                //             deleteProduct = true
                //         }
                //         const patmentUpdate = await updatePayment({ _id: payment._id }, { orderId: OrdersData._id })
                //         if (sellerPlanDetails) {
                //             sellerPlanDetails = await updateSellerPlan({ _id: sellerPlanDetails._id }, planData);
                //         } else {
                //             sellerPlanDetails = await createPlan(planData)
                //             sellerUpdate.planId = sellerPlanDetails._id
                //         }
                //         const sellerUpdateData = await updateSeller({ _id: seller._id }, sellerUpdate)
                //         const planLog = {
                //             ...userData,
                //             sellerPlanId: sellerPlanDetails._id,
                //             subscriptionId: planDetails._id,
                //             sellerDetails: { ...sellerDetails },
                //             planDetails: {
                //                 ..._p_details,
                //                 exprireDate: new Date(_p_details.exprireDate)
                //             },
                //             isSubscription
                //         }
                //         const OrderUpdate = await updateOrder({ _id: OrdersData._id }, { orderPlanId: orderItemData._id, paymentId: payment._id, planId: sellerPlanDetails._id, sellerPlanId: sellerPlanDetails._id })
                //         // Generate invoice
                //         const invoice = await createPdf(seller, { ..._p_details, totalPlanPrice: price, totalPrice, isFreeTrialIncluded, planValidFrom }, order_details)
                //         await addSellerPlanLog(planLog)
                //         if (deleteProduct === true && seller.sellerProductId && seller.sellerProductId.length) {
                //             updateSellerProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                //             updateMasterBulkProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                //             console.log('--- Old Service Type Product Status changed-------')
                //             // update product deleta status true

                //         }

                //         if (currency === 'INR' && checkMobile && isProd && planTo && planFrom && checkPaidSeller) {
                //             const msgData = {
                //                 plan: _p_details.planType,
                //                 currency: currency,
                //                 amount: includedGstAmount.totalAmount,
                //                 url: invoice.Location,
                //                 name: order_details.invoiceNo.toString() + '-invoice.pdf',
                //                 till: _p_details.exprireDate,
                //                 to: planTo,
                //                 from: planFrom
                //             }
                // /* await */ sendSMS(checkMobile, planChanged(msgData))
                //         } else if (currency === 'INR' && checkMobile && isProd) {
                //             const msgData = {
                //                 plan: _p_details.planType,
                //                 currency: currency,
                //                 amount: includedGstAmount.totalAmount,
                //                 url: invoice && invoice.Location || null,
                //                 name: order_details.invoiceNo.toString() + '-invoice.pdf',
                //                 till: _p_details.exprireDate
                //             }
                // /* await */ sendSMS(checkMobile, planSubscription(msgData))
                //         } else {
                //             console.log("================sms not send===========")
                //         }
                //         if (orderDetails && orderDetails.email/* seller && seller.email */ && planTo && planFrom && checkPaidSeller) {
                //             let planChangedEmailMsg = planChangedEmail({
                //                 oldPlanType,
                //                 newPlanType: _p_details.planType,
                //                 from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
                //                 till: _p_details.exprireDate,
                //                 // till: _p_details.subscriptionValidety,
                //                 url
                //             })
                //             const message = {
                //                 from: MailgunKeys.senderMail,
                //                 to: orderDetails && orderDetails.email || seller.email,
                //                 subject: 'Plan changed',
                //                 html: commonTemplate(planChangedEmailMsg),
                //             }
                //  /* await */ sendSingleMail(message)
                //         } else {
                //             console.log("==============Plan Changed Email Not Send====================")
                //         }
                //         if (orderDetails && orderDetails.email) {
                //             let invoiceEmailMsg = invoiceContent({
                //                 plan: _p_details.planType,
                //                 from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
                //                 till: _p_details.exprireDate,
                //                 price: includedGstAmount.totalAmount,
                //                 invoiceLink: invoice.Location,
                //                 cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
                //                 isOneBazzar: false
                //             });
                //             const message = {
                //                 from: MailgunKeys.senderMail,
                //                 to: orderDetails.email || seller.email,
                //                 subject: 'Ekbazaar Subscription activated successfully',
                //                 html: commonTemplate(invoiceEmailMsg),
                //                 // attachment: invoice.attachement,
                //                 attachments: [{ // stream as an attachment
                //                     filename: 'invoice.pdf',
                //                     content: fs.createReadStream(invoice.attachement)
                //                     // path: invoice.Location,
                //                 }]
                //             }
                //     /* await */ sendSingleMail(message)
                //         } else {
                //             console.log("==============Invoice Not Send====================")
                //         }
                //         await updateOrder({ _id: OrdersData._id }, { isEmailSent: true, invoicePath: invoice && invoice.Location || '' })
                //         console.log('------------------ Payment done ---------')
                // return respSuccess(res, { payment: true }, 'subscription activated successfully!')
              } else {
                console.log("-------  Payment Failled -------------");
                if (iswhatsapp === "true") {
                  const url = "https://app.chat360.io/api/ekbazaar/payment/status"
                  const paydetails = JSON.parse(body)
                  const data = {
                    sellerId, userId, 
                    paymentSuccess: false, 
                    payment_id: paymentResponse.razorpay_payment_id || "", 
                    error_code: paydetails.error.code || "", 
                    error_description: paydetails.error.description || "",
                    source:"ekbazaar"
                  }
                  await sendDatatoWhatsapp(url, data)
                }
                const paymentJson = {
                  ...userData,
                  paymentResponse: paymentResponse,
                  paymentDetails: JSON.parse(body),
                  paymentSuccess: false,
                  isSubscription
                };
                const payment = await addPayment(paymentJson);
                return respSuccess(res, { payment: false }, "Payment failed");
              }
            } catch (error) {
              console.log(error, "tttttttt");
            }
          });
        } else {
          console.log(planDetails, "TTTTTTTTTTTTTTTTT");
          return respSuccess(res, { payment: false }, "Payment failed");
        }
      }
    }
  } catch (error) {
    console.log(error);
    respError(error);
  }
};

module.exports.createRazorPayOrder = async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
      key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
    });
    const { planId, pincode, currency, isSubscription, email, mobile, sellerId, userId } = req.body;

    const seller = await getSeller(userId, null, { _id: sellerId });
    const city = seller && seller.location && seller.location.city && seller.location.city.name || '',
      state = seller && seller.location && seller.location.state && seller.location.state.name || ''

    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";
    if (!findpincode && currency === "INR") {
      respError(res, "Invalid pincode");
    } else {
      const planDetails = await getSubscriptionPlanDetail({ _id: planId });
      // console.log(planDetails, 'test')
      if (planDetails) {
        const gstValue = 18;
        const months =
          planDetails && planDetails.type === "Quarterly"
            ? 3
            : planDetails.type === "Half Yearly"
              ? 6
              : planDetails.type === "Yearly"
                ? 12
                : "";

        const pricePerMonth =
          planDetails &&
          (currency === "INR" ? planDetails.price : planDetails.usdPrice);
        const price = pricePerMonth; /* * parseInt(months) */
        const includedGstAmount = await CalculateGst(
          price,
          findpincode,
          currency
        );
        // const gstAmount = (parseFloat(price) * gstValue) / 100
        // const totalAmount = parseFloat(price) + gstAmount
        let result;

        // Creating Order ID For Order Type Payment
        if (!isSubscription) {
          result = await instance.orders.create({
            amount: parseInt(
              (includedGstAmount.totalAmount * 100).toFixed(2)
            ).toString(),
            currency,
            receipt: "order_9A33XWu170gUtm",
            payment_capture: 0,
          });
        }

        // Creating Subscription ID For Subscription Type Payment
        if (isSubscription) {
          let plan_id = planDetails && planDetails.plan_id;

          result = await instance.subscriptions.create({
            plan_id,
            total_count: parseInt(months),
            customer_notify: 1,
            notes: {
              client: "trade",
              planId,
              months,
              sellerId,
              userId,
              email,
              mobile: mobile.mobile,
              location: city && state
                ? `${city},${state}`
                : city && !state
                  ? `${city}`
                  : state && !city
                    ? `${state}` : '',
              url: req.get("origin")
            },
            notify_info: {
              notify_phone: `${mobile.mobile}`,
              notify_email: email,
            },
          });
          result.currency = currency;
        }
        // console.log(result, 'create Order')
        console.log(result, "@@@@@@@@@@@@@@@@@@@");

        respSuccess(res, { ...result, key_id: razorPayCredentials.key_id });
      }
    }
  } catch (error) {
    console.log(error);
    respError(error);
  }
};

module.exports.captureRazorPayPayment = async (req, res) => {
  try {
    const {
      sellerId,
      subscriptionId,
      orderDetails,
      userId,
      paymentResponse,
      currency,
      isSubscription,
      paymentId,
      verifyId,
    } = req.body;
    // console.log(
    //   "🚀 ~ file: paymentController.js ~ line 199 ~ module.exports.captureRazorPayPayment= ~  req.body",
    //   req.body
    // );

    const resVerifyId = isSubscription
      ? paymentResponse.razorpay_subscription_id
      : paymentResponse.razorpay_order_id;

    let verify;
    if (isSubscription) {
      verify = paymentResponse.razorpay_payment_id + "|" + verifyId;
    } else {
      verify = verifyId + "|" + paymentResponse.razorpay_payment_id;
    }

    let crypto = require("crypto");
    let expectedSignature = crypto
      .createHmac("sha256", razorPayCredentials.key_secret)
      .update(verify.toString())
      .digest("hex");

    let verifiedSignature = false

    if (expectedSignature === paymentResponse.razorpay_signature) {
      verifiedSignature = true
    }

    const url = req.get("origin");
    const dateNow = new Date();
    const gstValue = currency === "INR" ? 18 : 0;
    //  currency = 'INR'
    let deleteProduct = false;
    const pincode = orderDetails && orderDetails.pincode;
    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";
    if (!findpincode && currency === "INR") {
      respError(res, "Invalid pincode");
    } else {
      let seller = await getSellerProfile(sellerId);
      const planDetails = await getSubscriptionPlanDetail({
        _id: subscriptionId,
      });

      if (planDetails && seller && seller.length && verifiedSignature) {
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
        const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
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
        let price;
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

        const capturePayment = {
          method: "POST",
          url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
          form: {
            amount: parseInt(
              (includedGstAmount.totalAmount * 100).toFixed(2)
            ).toString(),
            currency,
          },
        };

        const fetchPayment = {
          method: "GET",
          url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${req.params.paymentId}`,
        };

        const requestApi = isSubscription ? fetchPayment : capturePayment;

        request(requestApi, async function (error, response, body) {
          try {
            console.log("Status:", response.statusCode);
            // console.log('Headers:', JSON.stringify(response.headers));
            const testbody = JSON.parse(body);
            const userData = {
              userId: seller.userId,
              sellerId: seller._id,
            };
            // if (response.statusCode === 200) {
            if (
              (!isSubscription && response.statusCode === 200) ||
              (isSubscription &&
                response.statusCode === 200 &&
                (testbody.status === "authorized" ||
                  testbody.status === "captured"))
            ) {
              const result = await assignPlantoUser(
                planDetails,
                seller,
                orderDetails,
                userData,
                paymentResponse,
                body,
                isSubscription,
                currency,
                subscriptionId,
                gstValue,
                price,
                includedGstAmount,
                existingGroup,
                currentGroup,
                sellerPlanDetails,
                totalPrice,
                deleteProduct,
                checkMobile,
                planTo,
                planFrom,
                checkPaidSeller,
                oldPlanType,
                url,
                dateNow
              );
              console.log(
                result,
                "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
              );
              if (result && result.status === "ok") {
                return respSuccess(
                  res,
                  { payment: true },
                  "subscription activated successfully!"
                );
              }

            } else {
              console.log("-------  Payment Failled -------------");
              const paymentJson = {
                ...userData,
                paymentResponse: paymentResponse,
                paymentDetails: JSON.parse(body),
                paymentSuccess: false,
                isSubscription,
              };
              const payment = await addPayment(paymentJson);
              return respSuccess(res, { payment: false }, "Payment failed");
            }

          } catch (err) {
            console.log(err, "tttttttt");
          }
        });
      } else return respSuccess(res, { payment: false }, "Payment failed");
    }

  } catch (error) {
    console.log(error);
    respError(error);
  }
};

module.exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log(paymentId, "111111111111111");
    const fetchPayment = {
      method: "GET",
      url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${paymentId}`,
    };

    request(fetchPayment, async function (error, response, body) {
      const paymentBody = JSON.parse(body);
      return respSuccess(res, { statusCode: response.statusCode, paymentStatus: paymentBody.status }, "Payment not authorized yet Please Wait");
    })
  } catch (err) {
    console.log(err, "@@@@@@@@@")
  }
}

module.exports.fetchSubscriptionPayment = async (req, res) => {
  try {
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
    const url = req.get("origin");
    const body = await fetchRazorpayPayment(paymentId)
    console.log("🚀 ~ file: paymentController.js ~ line 2766 ~ module.exports.fetchSubscriptionPayment=async ~ body", body)
    const isAssigned = await assignOurPlan(req.body, body, url, null);
    console.log("🚀 ~ file: paymentController.js ~ line 2767 ~ module.exports.fetchSubscriptionPayment=async ~ isAssigned", isAssigned)

    if (isAssigned && isAssigned.status === "ok") {
      return respSuccess(
        res,
        { payment: true },
        "subscription activated successfully!"
      );
    }


  } catch (error) {
    console.log(error);
    respError(error);
  }
}

module.exports.captureRazorPayPaymentTwo = async (req, res) => {
  try {
    const {
      sellerId,
      subscriptionId,
      orderDetails,
      userId,
      paymentResponse,
      currency,
      isSubscription,
      paymentId,
      verifyId,
    } = req.body;
    const url = req.get("origin");

    const data = {
      sellerId,
      subscriptionId,
      orderDetails,
      userId,
      paymentResponse,
      paymentId,
      isSubscription,
      originUrl: url,
      purchagId: verifyId,
      currency,
    };

    const resVerifyId = isSubscription
      ? paymentResponse.razorpay_subscription_id
      : paymentResponse.razorpay_order_id;

    let verify;
    if (isSubscription) {
      verify = paymentResponse.razorpay_payment_id + "|" + verifyId;
    } else {
      verify = verifyId + "|" + paymentResponse.razorpay_payment_id;
    }

    let crypto = require("crypto");
    let expectedSignature = crypto
      .createHmac("sha256", razorPayCredentials.key_secret)
      .update(verify.toString())
      .digest("hex");

    if (expectedSignature === paymentResponse.razorpay_signature) {
      const responce = await addPaymentData(data);
      console.log("----------Payment Verified------------------")
      return respSuccess(
        res,
        { payment: true },
        "subscription activated successfully!"
      );
    }
  } catch (error) {
    console.log(error);
    respError(error);
  }
};

const assignPlantoUser = async (
  planDetails,
  seller,
  orderDetails,
  userData,
  paymentResponse,
  body,
  isSubscription,
  currency,
  subscriptionId,
  gstValue,
  price,
  includedGstAmount,
  existingGroup,
  currentGroup,
  sellerPlanDetails,
  totalPrice,
  deleteProduct,
  checkMobile,
  planTo,
  planFrom,
  checkPaidSeller,
  oldPlanType,
  url,
  dateNow,
  iswhatsapp
) => {
  try {
    const invoiceNumner = await getInvoiceNumber({ id: 1 });
    const _invoice = (invoiceNumner && invoiceNumner.invoiceNumber) || "";
    let planExpireDate = dateNow.setDate(
      dateNow.getDate() + parseInt(planDetails.days)
    );
    let date = new Date();
    // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
    const SourceCode =
      seller && seller.hearingSource && seller.hearingSource.referralCode;
    let isFreeTrialIncluded = false;
    let planValidFrom = moment();

    if (
      seller &&
      seller.hearingSource &&
      seller.hearingSource.source === "Uttarakhand" &&
      seller.hearingSource.referralCode === "UTK1121"
    ) {
      if (seller && seller.planId && seller.planId.isTrial) {
        const trialCreatedAt = seller.planId && seller.planId.createdAt;
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
      { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
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
      ipAddress: (orderDetails && orderDetails.ipAddress) || null,
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
    
    if (iswhatsapp === "true") {
      const url = "https://app.chat360.io/api/ekbazaar/payment/status"
      const paydetails = JSON.parse(body)

      const data = {
        ...userData,
        paymentSuccess: true,
        payment_id: paymentResponse.razorpay_payment_id,
        amount: paydetails.amount,
        currency: paydetails.currency,
        status: paydetails.status,
        order_id: paydetails.order_id,
        captured: paydetails.captured,
        error_code: paydetails.error_code,
        error_description: paydetails.error_description,
        source: "ekbazaar",
        invoice: (invoice && invoice.Location) || ""
      }
      await sendDatatoWhatsapp(url, data)
    }

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
      console.log("--- Old Service Type Product Status changed-------");
      // update product deleta status true
    }

    if (
      deleteProduct === false &&
      seller.sellerProductId &&
      seller.sellerProductId.length
    ) {
      updateMasterBulkProducts(
        { _id: { $in: seller.sellerProductId } },
        { priority: 1 }
      );
      console.log("--- Old product priority changed-------");
      // update product deleta status true
    }

    // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
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
        name: order_details.invoiceNo.toString() + "-invoice.pdf",
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
        name: order_details.invoiceNo.toString() + "-invoice.pdf",
        till: _p_details.exprireDate,
      };
      /* await */ sendSMS(checkMobile, planSubscription(msgData));
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
        from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
        till: _p_details.exprireDate,
        // till: _p_details.subscriptionValidety,
        url,
      });
      const message = {
        from: MailgunKeys.senderMail,
        to: (orderDetails && orderDetails.email) || seller.email,
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
        from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
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
      console.log("==============Invoice Not Send====================");
    }
    await updateOrder(
      { _id: OrdersData._id },
      { isEmailSent: true, invoicePath: (invoice && invoice.Location) || "" }
    );
    console.log("------------------ Payment done ---------");
    return { status: "ok" };
    // return respSuccess(res, { payment: true }, 'subscription activated successfully!')
  } catch (error) {
    console.log("Errrrrrrrrrrrr...", error);
  }
};

const sendDatatoWhatsapp = async (url, data) => new Promise(async (resolve, reject) => {
  try {
     console.log(url, data,"===========Before sending data to whats app============");
    const response = await axios.post(url, data);
    resolve(response)
    console.log(url, data, "===========sending data to whatsapp Completed============");
  } catch (error) {
    resolve(error)
    console.log("🚀 ~ file: utils.js:433 ~ module.exports.insetInSheat= ~ error:", error)
  }
})

// For Manully Assign Plan.

// const insertPlaneInDb = async (sellerId, subscriptionId, orderDetails, paymentResponse, body,isSubscription) => {
//     try {
//         const currency = 'INR';
//         const url = 'https://trade.ekbazaar.com/';
//         const dateNow = new Date();
//         const gstValue = currency === 'INR' ? 18 : 0
//         let deleteProduct = false
//         const pincode = orderDetails && orderDetails.pincode;
//         let seller = await getSellerProfile(sellerId)
//         const planDetails = await getSubscriptionPlanDetail({ _id: subscriptionId })
//         seller = seller[0]
//         const checkMobile = seller && seller.mobile && seller.mobile.length && seller.mobile[0] && seller.mobile[0].mobile
//         const existingGroup = seller.sellerType[0].group
//         const currentGroup = planDetails.groupType

//         let sellerPlanDetails = seller && seller.planId ? await getSellerPlan({ _id: seller.planId }) : null;
//         const planTo = sellerPlanDetails && sellerPlanDetails.exprireDate;
//         const planFrom = sellerPlanDetails && sellerPlanDetails.createdAt;
//         const checkPaidSeller = sellerPlanDetails && sellerPlanDetails.isTrial === false;
//         const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
//         let newPlanType = '';

//         const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Half Yearly" ? 6 : planDetails.type === "Yearly" ? 12 : ''
//         const totalPrice = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
//         let price;
//         if (isSubscription) {
//             price = totalPrice / months
//         } else {
//             price = totalPrice
//         }
//         const includedGstAmount = await CalculateGst(price, findpincode, currency);

//         const userData = {
//             userId: seller.userId,
//             sellerId: seller._id,
//         }

//         const invoiceNumner = await getInvoiceNumber({ id: 1 })
//         const _invoice = invoiceNumner && invoiceNumner.invoiceNumber || ''
//         let planExpireDate = dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))
//         let date = new Date()
//         // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
//         const SourceCode = seller && seller.hearingSource && seller.hearingSource.referralCode;
//         let isFreeTrialIncluded = false;
//         let planValidFrom = moment()

//         if (seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller.hearingSource.referralCode === 'UTK1121') {
//             if (seller && seller.planId && seller.planId.isTrial) {
//                 const trialCreatedAt = seller.planId && seller.planId.createdAt;
//                 const today = moment();
//                 const daysFromRegistration = today.diff(moment(trialCreatedAt, 'DD-MM-YYYY'), 'days');
//                 const todayDate = new Date();
//                 if (daysFromRegistration <= 7) {
//                     planExpireDate = todayDate.setDate(todayDate.getDate() + parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration)

//                     planDetails.days = `${parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration}`

//                     isFreeTrialIncluded = true

//                     planValidFrom = moment(seller.planId.exprireDate)
//                 }
//             }
//         }
//         await updateInvoiceNumber({ id: 1 }, { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 })

//         const sellerDetails = {
//             name: orderDetails.name,
//             email: orderDetails.email || seller.email,
//             sellerType: seller.sellerType,
//             groupId: planDetails.groupType,
//             location: seller.location,
//             mobile: seller.mobile
//         }
//         const paymentJson = {
//             ...userData,
//             paymentResponse: paymentResponse,
//             paymentDetails: JSON.parse(body),
//             paymentSuccess: true,
//             isSubscription
//         }
//         const _p_details = {
//             subscriptionId: planDetails._id,
//             expireStatus: false,
//             name: planDetails.type,
//             price: planDetails.price,
//             usdPrice: planDetails.usdPrice,
//             description: planDetails.description,
//             features: planDetails.features,
//             days: planDetails.days,
//             extendTimes: null,
//             exprireDate: planExpireDate,
//             // subscriptionValidety,
//             hearingSourceCode: SourceCode,
//             isTrial: false,
//             planType: planDetails.type,
//             extendDays: planDetails.days,
//             groupType: planDetails.groupType,
//             billingType: planDetails.billingType,
//             priceUnit: planDetails.priceUnit,
//             type: planDetails.type,
//             currency
//         }
//         const payment = await addPayment(paymentJson)
//         const planData = {
//             ...userData,
//             ..._p_details,
//             isFreeTrialIncluded,
//             planValidFrom,
//             isSubscription,
//             canceled: false,
//             createdAt: new Date(),
//             createdOn: new Date()
//         }

//         const order_details = {
//             ...userData,
//             invoiceNo: _invoice,
//             invoicePath: '',
//             gstNo: orderDetails && orderDetails.gst || null,
//             address: orderDetails && orderDetails.address || null,
//             pincode: orderDetails && orderDetails.pincode || null,
//             country: orderDetails && orderDetails.country || null,
//             sellerDetails: {
//                 ...sellerDetails
//             },
//             // sellerPlanId: '', // seller plan collectio id
//             subscriptionId: subscriptionId,
//             // orderPlanId: '', // order items/plans id
//             gst: gstValue,
//             price: price,
//             gstAmount: includedGstAmount.gstAmount,
//             cgstAmount: includedGstAmount.cgstAmount,
//             sgstAmount: includedGstAmount.sgstAmount,
//             total: includedGstAmount.totalAmount,
//             orderedOn: new Date(),
//             hearingSourceCode: SourceCode,
//             // paymentId: '', // payment collection id
//             // paymentStatus: '',
//             ipAddress: orderDetails && orderDetails.ipAddress || null,
//             currency: currency,
//             isSubscription
//             // isEmailSent: ''
//         }
//         const OrdersData = await addOrders(order_details)

//         const orderItem = {
//             ...userData,
//             orderId: OrdersData._id,
//             subscriptionId: planDetails._id,
//             ..._p_details,
//             isFreeTrialIncluded,
//             planValidFrom,
//             isSubscription
//         }
//         const orderItemData = await addOrdersPlans(orderItem)
//         let sellerUpdate = {
//             paidSeller: true,
//             sellerVerified: true,
//             isSubscription
//         }
//         console.log(existingGroup, '!==', currentGroup, ' Group equality check------')
//         if (existingGroup !== currentGroup) {
//             const sellerType = await getAllSellerTypes(0, 10, { group: parseInt(currentGroup) })
//             const typeSeller = sellerType.map((item) => item._id)
//             sellerUpdate = {
//                 ...sellerUpdate,
//                 sellerType: typeSeller
//             }
//             deleteProduct = true
//         }
//         const patmentUpdate = await updatePayment({ _id: payment._id }, { orderId: OrdersData._id })
//         if (sellerPlanDetails) {
//             sellerPlanDetails = await updateSellerPlan({ _id: sellerPlanDetails._id }, planData);
//         } else {
//             sellerPlanDetails = await createPlan(planData)
//             sellerUpdate.planId = sellerPlanDetails._id
//         }
//         const sellerUpdateData = await updateSeller({ _id: seller._id }, sellerUpdate)

//         const planLog = {
//             ...userData,
//             sellerPlanId: sellerPlanDetails._id,
//             subscriptionId: planDetails._id,
//             sellerDetails: { ...sellerDetails },
//             planDetails: {
//                 ..._p_details,
//                 exprireDate: new Date(_p_details.exprireDate)
//             },
//             isSubscription
//         }
//         const OrderUpdate = await updateOrder({ _id: OrdersData._id }, { orderPlanId: orderItemData._id, paymentId: payment._id, planId: sellerPlanDetails._id, sellerPlanId: sellerPlanDetails._id })
//         // Generate invoice
//         const invoice = await createPdf(seller, { ..._p_details, totalPlanPrice: price, totalPrice, isFreeTrialIncluded, planValidFrom }, order_details)

//         await addSellerPlanLog(planLog)
//         if (deleteProduct === true && seller.sellerProductId && seller.sellerProductId.length) {
//             updateSellerProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
//             updateMasterBulkProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
//             console.log('--- Old Service Type Product Status changed-------')
//             // update product deleta status true

//         }

//         // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
//         if (currency === 'INR' && checkMobile && isProd && planTo && planFrom && checkPaidSeller) {
//             const msgData = {
//                 plan: _p_details.planType,
//                 currency: currency,
//                 amount: includedGstAmount.totalAmount,
//                 url: invoice.Location,
//                 name: order_details.invoiceNo.toString() + '-invoice.pdf',
//                 till: _p_details.exprireDate,
//                 to: planTo,
//                 from: planFrom
//             }
//                         /* await */ sendSMS(checkMobile, planChanged(msgData))
//         } else if (currency === 'INR' && checkMobile && isProd) {
//             const msgData = {
//                 plan: _p_details.planType,
//                 currency: currency,
//                 amount: includedGstAmount.totalAmount,
//                 url: invoice && invoice.Location || null,
//                 name: order_details.invoiceNo.toString() + '-invoice.pdf',
//                 till: _p_details.exprireDate
//             }
//                         /* await */ sendSMS(checkMobile, planSubscription(msgData))
//         } else {
//             console.log("================sms not send===========")
//         }
//         if (orderDetails && orderDetails.email/* seller && seller.email */ && planTo && planFrom && checkPaidSeller) {
//             let planChangedEmailMsg = planChangedEmail({
//                 oldPlanType,
//                 newPlanType: _p_details.planType,
//                 from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
//                 till: _p_details.exprireDate,
//                 // till: _p_details.subscriptionValidety,
//                 url
//             })
//             const message = {
//                 from: MailgunKeys.senderMail,
//                 to: orderDetails && orderDetails.email || seller.email,
//                 subject: 'Plan changed',
//                 html: commonTemplate(planChangedEmailMsg),
//             }
//                          /* await */ sendSingleMail(message)
//         } else {
//             console.log("==============Plan Changed Email Not Send====================")
//         }
//         if (orderDetails && orderDetails.email) {
//             let invoiceEmailMsg = invoiceContent({
//                 plan: _p_details.planType,
//                 from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
//                 till: _p_details.exprireDate,
//                 price: includedGstAmount.totalAmount,
//                 invoiceLink: invoice.Location,
//                 cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
//                 isOneBazzar: false
//             });
//             const message = {
//                 from: MailgunKeys.senderMail,
//                 to: orderDetails.email || seller.email,
//                 subject: 'Ekbazaar Subscription activated successfully',
//                 html: commonTemplate(invoiceEmailMsg),
//                 // attachment: invoice.attachement,
//                 attachments: [{ // stream as an attachment
//                     filename: 'invoice.pdf',
//                     content: fs.createReadStream(invoice.attachement)
//                     // path: invoice.Location,
//                 }]
//             }
//                             /* await */ sendSingleMail(message)
//         } else {
//             console.log("==============Invoice Not Send====================")
//         }
//         await updateOrder({ _id: OrdersData._id }, { isEmailSent: true, invoicePath: invoice && invoice.Location || '' })
//         console.log('------------------ Payment done ---------')

//     } catch (error) {
//         console.log(error);
//     }
// }

// module.exports.addPlanManully = async (req, res) => {
//     try {
//         const sellerId = '6246c493ef0d355b049654aa';
//         const isSubscription = false;
//         const subscriptionId = '601d2cbb88a56c05672ebe29';
//         const orderDetails = {
//             name: 'Deepak',
//             email: 'deepakmehndiarts558@gmail.com',
//             mobile: { countryCode: '+91', mobile: '9996905343' },
//             gst: '',
//             address: 'Sonipat',
//             pincode: '131101',
//             planName: 'Quarterly',
//             groupType: 'Manufacturers/Traders',
//             validityFrom: '10/07/2022',
//             validityTill: '08/10/2022',
//             price: 750,
//             gstAmount: 135,
//             total: '',
//             loader: true,
//             refresh: false,
//             active: true,
//             submitted: true,
//             paymentStatus: false,
//             country: '',
//             isSubscription: false,
//             isLinkGen: false,
//             isSubLink: false,
//             ipAddress: '49.37.241.205'
//         }

//         const paymentResponse = {
//             razorpay_payment_id: 'pay_IrVW5ut7tWZ5uT',
//             razorpay_order_id: 'order_IrVVRHo78SkAWP',
//             razorpay_signature: '0365887893b028a4eddc1687f365ef62b0b2e3598babed2d2adca7515fc82012'
//         }

//         // const paymentResponse = {
//         //     razorpay_payment_id: 'pay_JG3mxJwi9a9s7X',
//         //     razorpay_subscription_id: 'order_JG3mcZfNARxZPF',
//         //     razorpay_signature: '0365887893b028a4eddc1687f365ef62b0b2e3598babed2d2adca7515fc82012'
//         // }

//         let bodyReq = {}

//         request({
//             method: 'GET',
//             url: `https://rzp_live_CTVuq0QYf0mDPH:KOY2qN10NCtcbgZmtpq87wOW@api.razorpay.com/v1/payments/pay_JG3mxJwi9a9s7X`,

//         }, async function (error, response, body) {
//             bodyReq = body;
//             console.log(bodyReq,"11111111111111111111111111111");
//             insertPlaneInDb(sellerId, subscriptionId, orderDetails, paymentResponse, bodyReq, isSubscription);
//         })

//         insertPlaneInDb(sellerId, subscriptionId, orderDetails, paymentResponse, bodyReq, isSubscription);
//         // return respSuccess(res, { payment: true }, 'subscription activated successfully!')
//     } catch (error) {
//         console.log(error);
//     }
// }

module.exports.createStripePayment = async (req, res) => {
  try {
    let { amount, id, description, currency } = req.body;

    const customer = await stripe.customers.create({
      name: description.name || '',
      email: description.email,
      payment_method: id,
      address: {
        line1: description.address,
        country: description.country.value,
      }
    });
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: "USD",
      description: id,
      payment_method: id,
      confirm: true,
      customer: customer.id
    });

    console.log("Stripe Response :", payment);
    res.json({
      response: payment,
      message: "Payment Successful",
      success: true,
    });
  } catch (error) {
    console.log("Stripe Error: ", error);
    res.json({
      message: "Payment Failed",
      success: false,
    });
  }
};

module.exports.planActivation = async (req, res) => {
  try {
    const {
      sellerId,
      subscriptionId,
      orderDetails,
      userId,
      paymentResponse,
      currency,
      cardData,
      paymentMethod,
    } = req.body;


    const cardLastDigits = paymentMethod && paymentMethod.cardData && paymentMethod.cardData.last4;
    console.log(req.body, "req.bodyreq.body", cardLastDigits);

    console.log(
      cardLastDigits,
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",
      paymentMethod
    );

    console.log(
      "🚀 ~ file: paymentController.js ~ line 199 ~ module.exports.stripe= ~  req.body",
      req.body
    );
    const url = req.get("origin");
    const dateNow = new Date();
    const gstValue = currency === "INR" ? 18 : 0;
    //  currency = 'INR'
    let deleteProduct = false;
    const pincode = orderDetails && orderDetails.pincode;
    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";
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
        const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
        let newPlanType = "";

        const months =
          planDetails && planDetails.type === "Quarterly"
            ? 3
            : planDetails.type === "Half Yearly"
              ? 6
              : planDetails.type === "Yearly"
                ? 12
                : "";
        const pricePerMonth =
          planDetails &&
          (currency === "INR" ? planDetails.price : planDetails.usdPrice);
        const price = pricePerMonth; /*  * parseInt(months) */
        const includedGstAmount = await CalculateGst(
          price,
          findpincode,
          currency
        );
        console.log("🚀 ~ gggggggggggggggggggg  -------", includedGstAmount);

        // const gstAmount = (parseFloat(price) * gstValue) / 100
        // const totalAmount = parseFloat(price) + gstAmount

        // console.log(months, "-------", pricePerMonth, "-------", price, "-------", gstAmount, "-------", totalAmount)

        try {
          const userData = {
            userId: seller.userId,
            sellerId: seller._id,
          };
          const invoiceNumner = await getInvoiceNumber({ id: 1 });
          const _invoice = (invoiceNumner && invoiceNumner.invoiceNumber) || "";
          let planExpireDate = dateNow.setDate(
            dateNow.getDate() + parseInt(planDetails.days)
          );
          let date = new Date();
          // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
          const SourceCode =
            seller && seller.hearingSource && seller.hearingSource.referralCode;
          let isFreeTrialIncluded = false;
          let planValidFrom = moment();

          if (
            seller &&
            seller.hearingSource &&
            ((seller.hearingSource.source === "Uttarakhand" &&
              seller.hearingSource.referralCode === "UTK1121") || (seller.hearingSource.source === "Vietnam" &&
                seller.hearingSource.referralCode === "VNG20") || (seller.hearingSource.source === "African Union" &&
                  seller.hearingSource.referralCode === "AUG20") || (seller.hearingSource.source === "Germany" &&
                    seller.hearingSource.referralCode === "DEUEMI23") || (seller.hearingSource.source === "GCC" &&
                      seller.hearingSource.referralCode === "GCCG23"))
          ) {
            if (seller && seller.planId && seller.planId.isTrial) {
              const trialCreatedAt = seller.planId && seller.planId.createdAt;
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
            { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
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
            paymentDetails: paymentMethod,
            paymentSuccess: true,
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
            country: (orderDetails && orderDetails.country && orderDetails.country.label) || null,
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
          };
          const orderItemData = await addOrdersPlans(orderItem);
          let sellerUpdate = {
            paidSeller: true,
            sellerVerified: true,
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
              pricePerMonth,
              isFreeTrialIncluded,
              planValidFrom,
            },
            order_details
          );

          // const invoice = await createOnebazaarPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth, isFreeTrialIncluded, planValidFrom }, order_details)

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
            console.log("--- Old Service Type Product Status changed-------");
            // update product deleta status true
          }

          if (
            deleteProduct === false &&
            seller.sellerProductId &&
            seller.sellerProductId.length
          ) {
            updateMasterBulkProducts(
              { _id: { $in: seller.sellerProductId } },
              { priority: 1 }
            );
            console.log("--- Old product priority changed-------");
            // update product deleta status true
          }

          // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
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
              name: order_details.invoiceNo.toString() + "-invoice.pdf",
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
              name: order_details.invoiceNo.toString() + "-invoice.pdf",
              till: _p_details.exprireDate,
            };
            /* await */ sendSMS(checkMobile, planSubscription(msgData));
          } else {
            console.log("================sms not send===========");
          }
          console.log();
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
              to: (orderDetails && orderDetails.email) || seller.email,
              subject: "Plan changed",
              html: commonTemplate(planChangedEmailMsg),
            };
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
                // cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
                cardNo: cardLastDigits,
                isOneBazzar: true,
              });
              const message = {
                from: MailgunKeys.senderMail,
                to: orderDetails.email || seller.email,
                subject: "Onebazaar Subscription activated successfully",
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
              await sendSingleMail(message);
            } else {
              console.log("==============Invoice Not Send====================");
            }
            await sendSingleMail(message);
          } else {
            console.log("==============Invoice Not Send====================");
          }
          await updateOrder(
            { _id: OrdersData._id },
            {
              isEmailSent: true,
              invoicePath: (invoice && invoice.Location) || "",
            }
          );
          console.log("------------------ Payment done ---------");
          return respSuccess(
            res,
            { payment: true },
            "subscription activated successfully!"
          );
        } catch (err) {
          console.log(err);
        }
      } else return respSuccess(res, { payment: false }, "Payment failed");
    }
  } catch (error) {
    console.log(error);
    respError(error);
  }
};

module.exports.createStripeLink = async (req, res) => {
  try {
    let { sellerId, planId, pinCode, mobile } = req.body;

    let isSubscription = false;
    let currency = "USD"

    if (!sellerId) {
      return respError(res, "Seller ID is required for the payment link!")
    }

    if (!planId) {
      return respError(res, "Plan ID is required for the payment link!");
    }

    const planDetails = await getSubscriptionPlanDetail({
      _id: planId,
    });

    if (!planDetails) {
      return respError(res, "Please send a valid Plan ID.")
    }

    let sellerDetails = await getSellerProfile(sellerId);
    let seller = sellerDetails && sellerDetails[0];

    if (!seller) {
      return respError(res, "Seller ID is not valid!")
    }
    if (seller && seller.isPartialyRegistor) {
      return respError(res, "Please complete your profile first")
    }

    let pin = pinCode || (seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.pincode);

    if (!pin) {
      return respError(res, "Pin code is required!")
    }

    delete seller.mobile[0]._id

    const trialExp = new Date(seller && seller.planId && seller.planId.exprireDate)
    const dateNow = new Date();
    const trialCreatedAt = seller.planId && seller.planId.createdAt;
    const today = moment();
    const daysFromRegistration = today.diff(moment(trialCreatedAt, 'YYYY-MM-DD'), 'days');

    // console.log(planDetails.price, planDetails.gst, "BBBBBBBBBBB", planDetails)

    let gstPercent = planDetails.gst || 18;

    let orderDetails = {
      name: seller && seller.name || '',
      email: seller && seller.email || '',
      mobile: seller && seller.mobile[0] || {},
      gst: seller && seller.statutoryId && seller.statutoryId.GstNumber && seller.statutoryId.GstNumber.number || '',
      address: seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.address || '',
      pincode: pin,
      planName: planDetails && planDetails.type,
      groupType: planDetails && planDetails.groupType === 1 ? "Manufacturers/Traders" : planDetails.groupType === 2 ? 'Farmer' : 'Service' || '',
      validityFrom: seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller && seller.planId && seller.planId.isTrial && daysFromRegistration <= 7 ? moment(trialExp).format('DD/MM/YYYY') : moment(dateNow).format('DD/MM/YYYY'),
      validityTill: seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller && seller.planId && seller.planId.isTrial && daysFromRegistration <= 7
        ? moment(trialExp.setDate(trialExp.getDate() + parseInt(planDetails.days))).format('DD/MM/YYYY')
        : moment(dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))).format('DD/MM/YYYY') || '',
      price: planDetails && planDetails.price || '',
      gstAmount: planDetails && (planDetails.price * gstPercent) / 100,
      isSubscription: false,
      ipAddress: ""
    }


    const product = await stripe.products.retrieve(
      planDetails.strip_product
    );


    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: product.default_price,
          quantity: 1,
        },
      ],
      metadata: {
        sellerId: sellerId.toString(),
        userId: seller.userId.toString(),
        subscriptionId: planId
      }
    });

    const data = {
      sellerId,
      userId: seller.userId,
      isSubscription,
      currency,
      orderDetails,
      isSubLink: false,
      subscriptionId: planId,
      product,
      paymentLink
    };

    let stripPayLink = await createStripPayLinks(data)


    respSuccess(res, { paymentLink: paymentLink.url })
  } catch (error) {
    console.log("🚀 ~ file: paymentController.js:4331 ~ module.exports.createStripeLink=async ~ error:", error)
  }
}

// FOR SUCCESS RESPONSE HANDELING PURPOSE

let handleLinkPaymentSuccess = (data) => new Promise(async (resolve, reject) => {
  if (!data.payment_link) {
    resolve(true)
    return;
  }
  let pyaLinkId = data.payment_link;
  let payLinkData = await findStripPayLink({ "paymentLink.id": pyaLinkId })

  if (payLinkData) {

    const updateLink = await stripe.paymentLinks.update(
      pyaLinkId,
      { active: false }
    );

    let { userId, sellerId, isSubscription, subscriptionId, currency, orderDetails, isSubLink, product, paymentLink } = payLinkData

    const paymentIntents = await stripe.paymentIntents.retrieve(
      data.payment_intent
    )

    let paymentResponse = paymentIntents;
    const paymentMethod = await stripe.paymentMethods.retrieve(
      paymentIntents.payment_method
    );
    console.log("🚀 ~ file: paymentController.js:4482 ~ handleLinkPaymentSuccess ~ paymentMethod:", paymentMethod)

    const cardLastDigits = paymentMethod && paymentMethod.card && paymentMethod.card.last4;

    // const url = req.get("origin");
    let url = '';
    const dateNow = new Date();
    const gstValue = currency === "INR" ? 18 : 0;
    //  currency = 'INR'
    let deleteProduct = false;
    const pincode = orderDetails && orderDetails.pincode;
    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";

    if (!findpincode && currency === "INR") {
      // respError(res, "Invalid pincode");
      resolve(false)
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
        const isWhatsappApp = seller && seller.isWhatsappApp
        // console.log(seller, "rrr", isWhatsappApp, "tttttttttttttttttttttttttttt");
        let sellerPlanDetails =
          seller && seller.planId
            ? await getSellerPlan({ _id: seller.planId })
            : null;
        const planTo = sellerPlanDetails && sellerPlanDetails.exprireDate;
        const planFrom = sellerPlanDetails && sellerPlanDetails.createdAt;
        const checkPaidSeller =
          sellerPlanDetails && sellerPlanDetails.isTrial === false;
        const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
        let newPlanType = "";

        const months =
          planDetails && planDetails.type === "Quarterly"
            ? 3
            : planDetails.type === "Half Yearly"
              ? 6
              : planDetails.type === "Yearly"
                ? 12
                : "";
        const pricePerMonth =
          planDetails &&
          (currency === "INR" ? planDetails.price : planDetails.usdPrice);
        const price = pricePerMonth; /*  * parseInt(months) */
        const includedGstAmount = await CalculateGst(
          price,
          findpincode,
          currency
        );

        try {
          const userData = {
            userId: seller.userId,
            sellerId: seller._id,
          };
          const invoiceNumner = await getInvoiceNumber({ id: 1 });
          const _invoice = (invoiceNumner && invoiceNumner.invoiceNumber) || "";
          let planExpireDate = dateNow.setDate(
            dateNow.getDate() + parseInt(planDetails.days)
          );
          let date = new Date();
          // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
          const SourceCode =
            seller && seller.hearingSource && seller.hearingSource.referralCode;
          let isFreeTrialIncluded = false;
          let planValidFrom = moment();

          if (
            seller &&
            seller.hearingSource &&
            ((seller.hearingSource.source === "Uttarakhand" &&
              seller.hearingSource.referralCode === "UTK1121") || (seller.hearingSource.source === "Vietnam" &&
                seller.hearingSource.referralCode === "VNG20") || (seller.hearingSource.source === "African Union" &&
                  seller.hearingSource.referralCode === "AUG20") || (seller.hearingSource.source === "Germany" &&
                    seller.hearingSource.referralCode === "DEUEMI23") || (seller.hearingSource.source === "GCC" &&
                      seller.hearingSource.referralCode === "GCCG23"))
          ) {
            if (seller && seller.planId && seller.planId.isTrial) {
              const trialCreatedAt = seller.planId && seller.planId.createdAt;
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
            { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
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
            paymentDetails: paymentMethod,
            paymentSuccess: true,
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
            country: (orderDetails && orderDetails.country && orderDetails.country.label) || null,
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
          };
          const orderItemData = await addOrdersPlans(orderItem);
          let sellerUpdate = {
            paidSeller: true,
            sellerVerified: true,
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
              pricePerMonth,
              isFreeTrialIncluded,
              planValidFrom,
            },
            order_details
          );

          // const invoice = await createOnebazaarPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth, isFreeTrialIncluded, planValidFrom }, order_details)
          if (isWhatsappApp === true) {
            const url = "https://app.chat360.io/api/ekbazaar/payment/status"

            const data = {
              ...userData, source: "onebazaar",
              paymentSuccess: true,
              payment_id: paymentResponse.id,
              amount: paymentResponse.amount,
              currency: paymentResponse.currency,
              status: paymentResponse.status,
              orderId: null,
              captured: paymentResponse.charges.data[0].captured || "",
              error_description: "",
              invoice: (invoice && invoice.Location) || ""
            }
            await sendDatatoWhatsapp(url, data)
          }
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
            console.log("--- Old Service Type Product Status changed-------");
            // update product deleta status true
          }

          if (
            deleteProduct === false &&
            seller.sellerProductId &&
            seller.sellerProductId.length
          ) {
            updateMasterBulkProducts(
              { _id: { $in: seller.sellerProductId } },
              { priority: 1 }
            );
            console.log("--- Old product priority changed-------");
            // update product deleta status true
          }

          // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
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
              name: order_details.invoiceNo.toString() + "-invoice.pdf",
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
              name: order_details.invoiceNo.toString() + "-invoice.pdf",
              till: _p_details.exprireDate,
            };
            /* await */ sendSMS(checkMobile, planSubscription(msgData));
          } else {
            console.log("================sms not send===========");
          }
          console.log();
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
              to: (orderDetails && orderDetails.email) || seller.email,
              subject: "Plan changed",
              html: commonTemplate(planChangedEmailMsg),
            };
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
                // cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
                cardNo: cardLastDigits,
                isOneBazzar: true,
              });
              const message = {
                from: MailgunKeys.senderMail,
                to: orderDetails.email || seller.email,
                subject: "Onebazaar Subscription activated successfully",
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
              await sendSingleMail(message);
            } else {
              console.log("==============Invoice Not Send====================");
            }
            await sendSingleMail(message);
          } else {
            console.log("==============Invoice Not Send====================");
          }
          await updateOrder(
            { _id: OrdersData._id },
            {
              isEmailSent: true,
              invoicePath: (invoice && invoice.Location) || "",
            }
          );
          console.log("------------------ Payment done ---------");
          // return respSuccess(
          //   res,
          //   { payment: true },
          //   "subscription activated successfully!"
          // );
          resolve(true)
        } catch (err) {
          console.log(err);
          resolve(false)
        }

      } else {
        // return respSuccess(res, { payment: false }, "Payment failed");
        resolve(false)
      }
    }
  }else{
    resolve(false);
  }


  resolve(true)
})


// const endpointSecret = "whsec_3541ec50a270a77092f53ba8daf5704fa309854ccf84ebb234f22833c4ba60a3";
module.exports.captureStripWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];

    // let  sigArr = sig.split(',');

    // let timeArr =  sigArr[0].split('=');
    // let timeStamp = timeArr[1];


    let event = req.body;


    // const payload = req.body;

    // let jsonData = payload.toJSON();

    const secret = 'we_1MvzfKSIrsAhsOaI55sGtAKq';
    // var crypto = require('crypto');

    // var hmac = crypto.createHmac('sha256', stripeApiKeys.secretKey);

    // data = hmac.update(`${timeStamp}.${payload}`); 

    // gen_hmac = data.digest('hex');



    // const payloadString = JSON.stringify(payload, null, 2);

    // console.log(data,"&&&&&&&&&&&&&&&&: ", payload.toJSON())
    // console.log(gen_hmac,'\n\n\n');
    // console.log("&&&&&&&&&&&&&&&&: ", payloadString)
    // const header = await stripe.webhooks.generateTestHeaderString({
    //   payload: payload,
    //   secret,
    // });

    // console.log(`${timeStamp}.${jsonData}`,"============+++++",gen_hmac, "===========", req.headers['stripe-signature'])
    // const eventTest = stripe.webhooks.constructEvent(payloadString, header, secret);
    // console.log("🚀 ~ file: paymentController.js:4476 ~ module.exports.captureStripLinkPayment= ~ eventTest:", eventTest)

    // Do something with mocked signed event
    // expect(eventTest.id).to.equal(payload.id);

    // return false

    // try {
    //   event = await stripe.webhooks.constructEvent(payload, finalSig, secret);
    //   console.log("🚀 ~ file: paymentController.js:4466 ~ module.exports.captureStripLinkPayment=async ~ event:", event)
    // } catch (err) {
    //   console.log("🚀 ~ file: paymentController.js:4468 ~ module.exports.captureStripLinkPayment=async ~ err:", err)
    //   res.status(400).send(`Webhook Error: ${err.message}`);
    //   return;
    // }

    console.log(event, "==============================")
    let response = false;

    // Handle the event
    switch (event.type) {
      case 'payment_link.created':
        const paymentLinkCreated = event.data.object;
        // Then define and call a function to handle the event payment_link.created
        console.log(event.data, "--------payment_link.created=========")
        response = true
        break;
      case 'payment_link.updated':
        const paymentLinkUpdated = event.data.object;
        // Then define and call a function to handle the event payment_link.updated
        console.log(event.data, "--------payment_link.updated=========")
        response = true
        break;
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        response = await handleLinkPaymentSuccess(checkoutSession)
        break;
      case 'checkout.session.failed':
        const failedPaymentIntent = event.data.object;
        console.log('Payment failed:--------------------', failedPaymentIntent.id);
        break;
      // ... handle other event types
      default: 
        console.log(`Unhandled event type ${event.type}`);
    }
    if (response) {
      res.status(200).json({ status: 'ok' })
    } else {
      res.status(400).json({ status: 'Internal Server Issue' })
    }
  } catch (error) {
    console.log("🚀 ~ file: paymentController.js:4466 ~ module.exports.captureStripLinkPayment=async ~ error:", error)

  }
}

module.exports.addCashPlan = async (req, res) => {
  try {
    let { mobileNumber, months, pinCode } = req.body;

    let allowedMonths = [3,6,12]

    if(!months){
      return respError(res,"Please enter plan months");
    }

    if (!allowedMonths.includes(months)){
      return respError(res,"Please enter a valid Plan time")
    }

    let currency = "INR"

    const gstValue = currency === "INR" ? 18 : 0;

    let userId = await getUserData({ mobile: mobileNumber });
    // console.log("🚀 ~ file: paymentController.js:5011 ~ module.exports.addCashPlan= ~ user:", user);
    if(!userId){
      return respError(res,"Mobile Number does not exist!")
    }
    let sellerDetails = await getSellerAllDetails({ userId: userId._id})
    if(!sellerDetails && !sellerDetails.length){
      return respError(res, "Mobile Number does not exist !")
    }

    let seller = sellerDetails && sellerDetails[0];
    let sellerId = seller._id;

    let groupType = seller.sellerType && seller.sellerType.length && seller.sellerType[0].group;

    let type = months == 3 ? 'Quarterly' : months == 6 ? "Half Yearly" : "Yearly";
    const planDetails = await getSubscriptionPlanDetail({
      groupType,
      type
    });

    let subscriptionId = planDetails._id;

    let pin = pinCode || (seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.pincode);

    if (!pin) {
      return respError(res, "Pin code is required!")
    }

    delete seller.mobile[0]._id

    const trialExp = new Date(seller && seller.planId && seller.planId.exprireDate)
    const dateNow = new Date();
    const trialCreatedAt = seller.planId && seller.planId.createdAt;
    const today = moment();
    const daysFromRegistration = today.diff(moment(trialCreatedAt, 'YYYY-MM-DD'), 'days');

    let gstPercent = planDetails.gst || 18;

    let orderDetails = {
      name: seller && seller.name || '',
      email: seller && seller.email || '',
      mobile: seller && seller.mobile[0] || {},
      gst: seller && seller.statutoryId && seller.statutoryId.GstNumber && seller.statutoryId.GstNumber.number || '',
      address: seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.address || '',
      pincode: pin,
      planName: planDetails && planDetails.type,
      groupType: planDetails && planDetails.groupType === 1 ? "Manufacturers/Traders" : planDetails.groupType === 2 ? 'Farmer' : 'Service' || '',
      validityFrom: seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller && seller.planId && seller.planId.isTrial && daysFromRegistration <= 7 ? moment(trialExp).format('DD/MM/YYYY') : moment(dateNow).format('DD/MM/YYYY'),
      validityTill: seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller && seller.planId && seller.planId.isTrial && daysFromRegistration <= 7
        ? moment(trialExp.setDate(trialExp.getDate() + parseInt(planDetails.days))).format('DD/MM/YYYY')
        : moment(dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))).format('DD/MM/YYYY') || '',
      price: planDetails && planDetails.price || '',
      gstAmount: planDetails && (planDetails.price * gstPercent) / 100,
      isSubscription: false,
      ipAddress: ""
    }

    let deleteProduct = false;
    const pincode = orderDetails && orderDetails.pincode;
    let findpincode = currency === "INR" ? await findPincode({ pincode }) : "";

    if (!findpincode) {
      return respError(res, "Invalid Pin Code");
    } else {
      if (planDetails && seller) {
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
        const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
        let newPlanType = "";

        const months =
          planDetails && planDetails.type === "Quarterly"
            ? 3
            : planDetails.type === "Half Yearly"
              ? 6
              : planDetails.type === "Yearly"
                ? 12
                : "";
        const pricePerMonth =
          planDetails &&
          (currency === "INR" ? planDetails.price : planDetails.usdPrice);
        const price = pricePerMonth; /*  * parseInt(months) */
        const includedGstAmount = await CalculateGst(
          price,
          findpincode,
          currency
        );

        try {
          const userData = {
            userId: seller.userId,
            sellerId: seller._id,
          };
          const invoiceNumner = await getInvoiceNumber({ id: 1 });
          const _invoice = (invoiceNumner && invoiceNumner.invoiceNumber) || "";
          let planExpireDate = dateNow.setDate(
            dateNow.getDate() + parseInt(planDetails.days)
          );
          let date = new Date();
          // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
          const SourceCode =
            seller && seller.hearingSource && seller.hearingSource.referralCode;
          let isFreeTrialIncluded = false;
          let planValidFrom = moment();

          let url = ''

          if (
            seller &&
            seller.hearingSource &&
            ((seller.hearingSource.source === "Uttarakhand" &&
              seller.hearingSource.referralCode === "UTK1121") || (seller.hearingSource.source === "Vietnam" &&
                seller.hearingSource.referralCode === "VNG20") || (seller.hearingSource.source === "African Union" &&
                  seller.hearingSource.referralCode === "AUG20") || (seller.hearingSource.source === "Germany" &&
                    seller.hearingSource.referralCode === "DEUEMI23") || (seller.hearingSource.source === "GCC" &&
                      seller.hearingSource.referralCode === "GCCG23"))
          ) {
            if (seller && seller.planId && seller.planId.isTrial) {
              const trialCreatedAt = seller.planId && seller.planId.createdAt;
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
            { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 }
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
            paymentResponse: { method: 'cash' },
            paymentDetails: {method:'cash'},
            paymentSuccess: true,
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
            country: (orderDetails && orderDetails.country && orderDetails.country.label) || null,
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
          };
          const orderItemData = await addOrdersPlans(orderItem);
          let sellerUpdate = {
            paidSeller: true,
            sellerVerified: true,
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
          console.log(seller,
            {
              ..._p_details,
              totalPlanPrice: price,
              pricePerMonth,
              isFreeTrialIncluded,
              planValidFrom,
            },
            order_details,
            "######################"
          )
          const invoice = await createPdf(
            seller,
            {
              ..._p_details,
              totalPlanPrice: price,
              pricePerMonth,
              isFreeTrialIncluded,
              planValidFrom,
            },
            order_details
          );


          // const invoice = await createOnebazaarPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth, isFreeTrialIncluded, planValidFrom }, order_details)

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
            console.log("--- Old Service Type Product Status changed-------");
            // update product deleta status true
          }

          if (
            deleteProduct === false &&
            seller.sellerProductId &&
            seller.sellerProductId.length
          ) {
            updateMasterBulkProducts(
              { _id: { $in: seller.sellerProductId } },
              { priority: 1 }
            );
            console.log("--- Old product priority changed-------");
            // update product deleta status true
          }

          // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
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
              name: order_details.invoiceNo.toString() + "-invoice.pdf",
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
              name: order_details.invoiceNo.toString() + "-invoice.pdf",
              till: _p_details.exprireDate,
            };
            /* await */ sendSMS(checkMobile, planSubscription(msgData));
          } else {
            console.log("================sms not send===========");
          }
          console.log();
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
              to: (orderDetails && orderDetails.email) || seller.email,
              subject: "Plan changed",
              html: commonTemplate(planChangedEmailMsg),
            };
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
              });
              const message = {
                from: MailgunKeys.senderMail,
                to: orderDetails.email || seller.email,
                subject: "Onebazaar Subscription activated successfully",
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
              await sendSingleMail(message);
            } else {
              console.log("==============Invoice Not Send====================");
            }
            await sendSingleMail(message);
          } else {
            console.log("==============Invoice Not Send====================");
          }
          await updateOrder(
            { _id: OrdersData._id },
            {
              isEmailSent: true,
              invoicePath: (invoice && invoice.Location) || "",
            }
          );
          console.log("------------------ Payment done ---------");
          return respSuccess(
            res,
            { payment: true, invoice },
            "subscription activated successfully!"
          );
          // resolve(true)
        } catch (err) {
          console.log(err);

          respError(res, "Server side issue")
          // resolve(false)
        }

      } else {
        return respSuccess(res, { payment: false }, "Payment failed");
        // resolve(false)
      }
    }

    
    
    respSuccess(res, { planDetails, orderDetails });

  } catch (error) {
    console.log("🚀 ~ file: paymentController.js:5010 ~ module.exports.addCashPlan= ~ error:", error)
  }
}

