const moment = require('moment')
const Papa = require('papaparse')
const path = require("path");
const fs = require('fs').promises
const {
    getAllPrimaryCategory,
    updatePrimaryCategory,
    getSecondaryCategoryByName,
    updateSecondaryCategory
} = require('../../modules/categoryModule')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const axios = require('axios')

const { getMasterRecords, updateMasterBulkProducts, updateMaster, getMaster, bulkDeleteMasterProducts } = require('../../modules/masterModule')

const { getSellerPlan, deleteSellerPlans } = require('../../modules/sellerPlanModule')
const { getUserList, deleteBuyer, deleteUser, deleteBuyers } = require('../../modules/buyersModule')
const { searchProducts, deleteSellerProducts } = require('../../modules/sellerProductModule')
const { getAllSellerData, deleteSellerRecord, getSeller, getSellersListData } = require('../../modules/sellersModule');
const { getCountryData, addCity, getCity, getCityList } = require('../../modules/locationsModule')
const { deleteChatAccount, userLogin, userChatLogin } = require('./rocketChatController')
const { rocketChatAdminLogin } = require('../../utils/globalConstants')
const SellerSchema = require('../../models/sellersSchema')
const _ = require('lodash')
const admin = {
    username: rocketChatAdminLogin.username,
    password: rocketChatAdminLogin.password
}

module.exports.updateLevel2l1Data = async (req, res) => {

    try {
        const result = await getAllPrimaryCategory('', 0, 1000)
        console.log(result, result.length, 'testing')
        for (let index = 0; index < result.length; index++) {
            const element = result[index];
            const updateData = {
                l1: element.parentCatId.vendorId
            }
            const updateResult = await updatePrimaryCategory(element._id, updateData)
            console.log(index, "  updateData", updateResult)

        }
        console.log('Completed++++++++++++')
        respSuccess(res, 'updated successfully')

    } catch (error) {

        console.log(error)
        respError(error)

    }

}

module.exports.updateLevel3l1Data = async (req, res) => {

    try {
        const result = await getSecondaryCategoryByName({ l1: "true" })
        console.log(result, result.length, 'testing')
        for (let index = 0; index < result.length; index++) {
            const element = result[index];
            const updateData = {
                l1: element.primaryCatId.l1
            }
            console.log(element._id, ' ---- id')
            const updateResult = await updateSecondaryCategory(element._id, updateData)
            console.log(index, "  updateData", updateResult)

        }
        console.log('Completed++++++++++++')
        // respSuccess(res, 'updated successfully')

    } catch (error) {

        console.log(error)
        respError(error)

    }

}

module.exports.updatePriority = async (req, res) => new Promise(async (resolve, reject) => {

    try {


        const result = await getMasterRecords({ flag: 1 }, { skip: 0, limit: 1000 })
        // console.log(JSON.stringify(result[0].sellerId._id), 'update preiority')
        let updateIds = []
        if (result.length) {
            for (let index = 0; index < result.length; index++) {
                let priority = 0
                const element = result[index];
                if (!element.userId) {
                    // console.log('4-------------')
                    priority = 4
                } else if (element.sellerId._id && element.sellerId._id.planId) {
                    // console.log('3-------------')
                    const plan = await getSellerPlan({ _id: element.sellerId._id.planId })
                    if (plan) {
                        const currentDate = moment().format('YYYY-MM-DD')
                        const expireDate = moment(plan.exprireDate).format('YYYY-MM-DD')
                        // console.log(moment(currentDate).isSameOrAfter(expireDate), ' ggggggggggggggg')

                        if (plan.isTrial) {
                            priority = 2
                        } else if (moment(currentDate).isSameOrAfter(expireDate)) {
                            priority = 3
                        } else if (!moment(currentDate).isSameOrAfter(expireDate)) {
                            priority = 1
                        }
                    } else {
                        priority = 4
                    }

                } else {
                    priority = 4
                }
                const updateData = {
                    priority
                }
                updateIds.push(element._id)
                await updateMaster({ _id: element._id }, updateData)
            }
            console.log(updateIds, ' Updated ids result-----------')
            await updateMasterBulkProducts({ _id: { $in: updateIds } }, { flag: 2 })
            console.log(' -------- Proprity Mapping COmpletes --------------')
        } else {
            console.log('----------------- NO master records -------------')
        }
        resolve()
    } catch (error) {
        console.log(error)

        reject(error)
    }

})

module.exports.deleteTestData = async (req, res) => new Promise(async (resolve, reject) => {
    try {

        console.log(admin, 'test data delete-----------------')
        // const result = await getUserList({ /* _id: "60696bce36878670aa4863eb"  *//* name: "test" */  $where: "/^1.*/.test(this.mobile)" }, 1000)
        const mon = [
            9377531777,
            8654123789,
            6546546546,
            0000000000,
            7633940634,
            4666666666,
            4547768676,
            9785767654,
            8870790799,
            7876545747,
            5656564444,
            9877343242,
            7676768769,
            9743685882,
            9691606259,
            9797094927,
            7796687567,
            9099265054,
            4498154915,
            6000000001,
            4687897984,
            9476287982,
            9817617378,
            9761999916,
            9997306309,
            9864534547,
            7895489457,
            8998988909,
            8946846546,
            6547657568,
            7643584376,
            5465465745,
            4576576586,
            7249842876,
            1122334455,
            2398723028,
            9845651007,
            8277759312,
            9876543213,
            8277759315,
            4565621231,
            8277759314,
            4564515410,
            8312342131,
            9442627648,
            8723648723,
            8652321321,
            5645645064,
            9533320452,
            8091259337,
            7852369411,
            8765655454,
            4564646546,
            9999555555,
            9345620764,
            9905471208,
            9665766747,
            8989376376,
            8776785876,
            5555555555,
            1122555446,
            7898785876,
            7847886005,
            8888855555,
            5443523423,
            9889666534,
            6756454556,
            9500183467,
            6567455665,
            4676687877,
            6564564757,
            8888688886,
            9686865157,
            9738554506,
            1654564564,
            6873256757,
            6754656533,
            8610796380,
            7897894545,
            5456765756,
            5675674567,
            8885552226,
            9686865157,
            4768425475,
            7675645353,
            8277759300,
            9883377223,
            5478657467,
            7657687857,
            9035594482,
            9486951440,
            8765657465,
            2635273571,
            9686523659,
            7879798797,
            7975406493,
            9533329087,
            6309481972,
            7887967856,
            8798787956,
            2323232323,
            6786788769,
            9576568976,
            9488774951,
            9443560254,
            9842231522,
            9442664707,
            9159242224,
            9443379589,
            9442607366,
            9442571455,
            9843023233,
            9586670953,
            9786676801,
            9750772900,
            9747878200,
            4232284250,
            9442791199,
            9787442424,
            9840489996,
            7667067374,
            9442693095,
            9442552707,
            9442134134,
            9486626516,
            4262261255,
            9486176134,
            9486188877,
            9443102212,
            6325148697,
            9443061322,
            9442791212,
            4266270936,
            9446033986,
            4232284139,
            4266271457,
            9442314444,
            4232284892,
            9443585448,
            9442251218,
            4262206294,
            9487966113,
            9842271190,
            7698070987,
            9442170881,
            9442622810,
            9443059299,
            9442171439,
            9943089680,
            9842720840,
            9894340458,
            6699669966,
            9487531481,
            9988442314,
            9442271456,
            9843039467,
            9842258627,
            9442368750,
            7358965563,
            9486586546,
            9159500880,
            9443031373,
            9443129785,
            9447775502,
            9843030563,
            9443039491,
            9486023744,
            9446422874,
            9486394641,
            9443046111,
            9495144492,
            9443523261,
            4232258706,
            9443061444,
            9443031246,
            9486188709,
            8903911355,
            9486671117,
            4232230419,
            9744991213,
            9443360517,
            4266279877,
            9443560501,
            9442084006,
            9447749994,
            9568094740,
            9443367452,
            9843433056,
            4232231190,
            9443522141,
            4262220055,
            9445062055,
            9884407077,
            9486861266,
            9442621860,
            9443375713,
            9626106660,
            9443330739,
            9487790964,
            4232284114,
            9500799999,
            9843464188,
            9443208225,
            9443032046,
            9443069088,
            9443524140,
            9751015556,
            9443031275,
            9344703439,
            9159811522,
            4266271829,
            9443022259,
            4266276656,
            9442790877,
            9566000226,
            8988968757,
            9523964558,
            9565786586,
            8465210485,
            4852145125,
            7845478521,
            4521045623,
            8745127845,
            7870870970,
            6578978798,
            9880559139,
            9328664900,
            9686098203,
            9443532768,
            9286509902,
            7676461486,
            4452369887,
            9876543211,
            8678687689,
            5678687785,
            4745743674,
            7644765746,
            4222223942,
            4746478678,
            4253221026,
            7483687486,
            8784758748,
            8487576646,
            9869071684,
            9163209070,
            9902775740,
            9805509269,
            9163565901,
            7582446398,
            9978605440,
            8160488534,
            9825150569,
            9913545584,
            7096103926,
            8460075253,
            9979869331,
            9967356190,
            8000010700,
            9913257501,
            8652147896,
            6452052055,
            9568234455,
            9825070953,
            9586313776,
            9686301001,
            4735747375,
            9428759570,
            9924142857,
            9898573760,
            9664928132,
            9427488861,
            7738566768,
            9825607618,
            8000454577,
            2353454345,
            4454487878,
            9483632704,
            9198244851,
            9328941044,
            9252613331,
            7347265867,
            9725462444,
            9377775560,
            8048762026,
            9640681047,
            0804532726,
            6767675654,
            4455653453,
            3254365457,
            3454535353,
            4565768768,
            6000000456,
            9825618280,
            8870539776,
            9980966929,
            9008893627,
            9008893627,
            9008893627,
            4575879789,
            9375690002,
            7546465364,
            7527825885,
            9900102701,
            9743332477,
            7567914441,
            8277759313,
            8437983740,
            8919918505,
            9379563852,
            9033234406,
            9391027776,
            9924539883,
            5623426758,
            7984789444,
            9824246488,
            9898549306,
            9945093890,
            9033263061,
            9898036799,
            9925915870,
            8147207720,
            9539759370,
            8105406822,
            5675755675,
            5345353543,
            9916825719,
            9916820705,
            9916825803,
            9916825804,
            8754512415,
            9916825805,
            9916825806,
            9916825807,
            9874563214,
            9426010352,
            5455454548,
            2758588338,
            987654321,
            8123928832,
            4895745675,
            9865432156,
            9822968560,
            9376945281,
            9825222974,
            9727764162,
            9844214809,
            1234567000,
            4576654765,
            6353490407,
            7204644670,
            8597687878,
            5678975479,
            9533320451,
            9825017683,
            5487686586,
            9879457348,
            9015654810,
            9986116064,
            9099943748,
            7259842876,
            9008988972,
            9886253247,
            9886253247,
            1999999999,
            9824111711,
            9886263247,
            9876263247,
            9745632145,
            9896263247,
            9806526604,
            8980134919,
            9898021557,
            7984364706,
            9925390085,
            9974046274,
            7984964206,
            9925010205,
            9727617201,
            8660759817,
            9686301013,
            8511964939,
            9876541323,
            9982475566,
            9016876311,
            9016876311,
            9008988972,
            9876543690,
            9551009510,
            9945618246,
            9945612645,
            8505492565,
            9377750505,
            9033465616,
            2356895632,
            9008312615,
            9985488594,
            8618790263,
            8770041250,
            8895544650,
            9875641236,
            9014571186,
            8894554656,
            5464646464,
            8268736286,
            9632587412,
            9856565562,
            9998973304,
            8978575222,
            9743277007,
            7028913593,
            9979727410,
            9426074833,
            9375555456,
            9974697906,
            9925211307,
            9909652024,
            9726230628,
            8248148427,
            9687744545,
            9164449169,
            9916542164,
            9909146777,
            8980181614,
            8499998866,
            8762834323,
            7259842876,
            9695944893,
            9825372977,
            9027332421,
            6364510371,
            8499998866,
            7567832899,
            8277759000,
            9722975964,
            9676263289,
            9886253247,
            9374711585,
            5563856695,
            8925456818,
            9336628793,
            9008988972,
            9825817785
        ]
        const emails = [
            "sriraman1807@gmail.com",
            "anupureddy1234@gmail.com",
            "rakshisowmya@gmail.com",
            "sriraman@gmail.com",
            "sowmyat.swam@gmail.com",
            "sriraman1807@gmail.com",
            "ashu@gmail.com",
            "darsh@co.io",
            "darshan@co.io"
        ]
        // const result = await getUserList({ email: { $in: emails } })
        // console.log("🚀 ~ file: testController.js ~ line 135 ~ module.exports.deleteTestData ~ result", result.length)
        // const userIds = []
        // const sellerIds = []
        // if (result && result.length) {
        //     for (let index = 0; index < result.length; index++) {
        //         const user = result[index];
        //         // const chatLog = await userChatLogin({ userId: "60023283293d9c7dacb6d705", username: admin.username, password: admin.password })
        //         // const chatDetails = {
        //         //     mobile: user.mobile || '',
        //         //     token: chatLog.authToken,
        //         //     userId: chatLog.userId

        //         // }
        //         // const chatDelete = await deleteChatAccount(chatDetails)
        //         // console.log(chatDelete, ' -------chat delete --------------')
        //         const userId = user._id
        //         userIds.push(user._id)
        //         const sellers = await getAllSellerData({ /* userId */ 'mobile.mobile': { $in: [user.mobile.toString()] }, userId: { $ne: null } }, { skip: 0, limit: 20 })
        //         console.log("🚀 ~ seller lenth", sellers && sellers.length)
        //         if (sellers && sellers.length) {
        //             for (let index = 0; index < sellers.length; index++) {
        //                 const _seller = sellers[index];
        //                 const sellerId = _seller._id
        //                 sellerIds.push(sellerId)
        //                 const productids = _seller.sellerProductId
        //                 console.log("-- Product ids ", productids)
        //                 const m_dele = await bulkDeleteMasterProducts({ _id: { $in: productids } })
        //                 console.log('-------- delete master---------')
        //                 const p_dele = await deleteSellerProducts({ _id: { $in: productids } })
        //                 console.log('-------- delete  Seller Products---------')

        //                 const delMaster1 = await deleteSellerPlans({ sellerId: sellerId });
        //                 console.log('-------- delete  Seller Plan---------')
        //                 const _sellerDel = await deleteSellerRecord({ userId: userId });
        //                 console.log('-------- delete  Seller Data---------')
        //                 const _buyer = await deleteBuyer({ userId: userId })
        //                 console.log('-------- delete  Buyer Data---------')
        //             }
        //         }

        //         const investmentUrl = `http://localhost:8050/api/deleteInvesterDetails/${userId}`

        //         // delete from investment
        //         const respRes = await axios.post(investmentUrl, {
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 // 'authorization': `ekbazaar|${token}`,
        //             },
        //             data: {
        //                 userId
        //             }
        //         });
        //         console.log(respRes.data, ' onvestor deleted @@@@@@@@@ -------------')
        //     }
        //     const del = await deleteUser({ _id: { $in: userIds } })
        //     console.log('------- User Ids Deleted -----------')
        //     console.log(sellerIds, userIds, ' -------- deletion comnpletes-------')
        //     respSuccess(res, result)
        // } else {
        //     respError(res, "No user list")
        // }


    } catch (error) {
        console.log(error, ' jjjjjjjjjjjjjjjjjjjjj')
    }
})

module.exports.deleteTestDataRemaining = async (req, res) => new Promise(async (resolve, reject) => {

    try {
        console.log(' delete remaining test accounts ------------------')
        const mob = [
            "9377531777",
            "8654123789",
            "6546546546",
            "0000000000",
            "7633940634",
            "4666666666",
            "4547768676",
            "9785767654",
            "8870790799",
            "7876545747",
            "5656564444",
            "9877343242",
            "7676768769",
            "9743685882",
            "9691606259",
            "9797094927",
            "7796687567",
            "9099265054",
            "4498154915",
            "6000000001",
            "4687897984",
            "9476287982",
            "9817617378",
            "9761999916",
            "9997306309",
            "9864534547",
            "7895489457",
            "8998988909",
            "8946846546",
            "6547657568",
            "7643584376",
            "5465465745",
            "4576576586",
            "7249842876",
            "1122334455",
            "2398723028",
            "9845651007",
            "8277759312",
            "9876543213",
            "8277759315",
            "4565621231",
            "8277759314",
            "4564515410",
            "8312342131",
            "9442627648",
            "8723648723",
            "8652321321",
            "5645645064",
            "9533320452",
            "8091259337",
            "7852369411",
            "8765655454",
            "4564646546",
            "9999555555",
            "9345620764",
            "9905471208",
            "9665766747",
            "8989376376",
            "8776785876",
            "5555555555",
            "1122555446",
            "7898785876",
            "7847886005",
            "8888855555",
            "5443523423",
            "9889666534",
            "6756454556",
            "9500183467",
            "6567455665",
            "4676687877",
            "6564564757",
            "8888688886",
            "9686865157",
            "9738554506",
            "1654564564",
            "6873256757",
            "6754656533",
            "8610796380",
            "7897894545",
            "5456765756",
            "5675674567",
            "8885552226",
            "9686865157",
            "4768425475",
            "7675645353",
            "8277759300",
            "9883377223",
            "5478657467",
            "7657687857",
            "9035594482",
            "9486951440",
            "8765657465",
            "2635273571",
            "9686523659",
            "7879798797",
            "7975406493",
            "9533329087",
            "6309481972",
            "7887967856",
            "8798787956",
            "2323232323",
            "6786788769",
            "9576568976",
            "9488774951",
            "9443560254",
            "9842231522",
            "9442664707",
            "9159242224",
            "9443379589",
            "9442607366",
            "9442571455",
            "9843023233",
            "9586670953",
            "9786676801",
            "9750772900",
            "9747878200",
            "4232284250",
            "9442791199",
            "9787442424",
            "9840489996",
            "7667067374",
            "9442693095",
            "9442552707",
            "9442134134",
            "9486626516",
            "4262261255",
            "9486176134",
            "9486188877",
            "9443102212",
            "6325148697",
            "9443061322",
            "9442791212",
            "4266270936",
            "9446033986",
            "4232284139",
            "4266271457",
            "9442314444",
            "4232284892",
            "9443585448",
            "9442251218",
            "4262206294",
            "9487966113",
            "9842271190",
            "7698070987",
            "9442170881",
            "9442622810",
            "9443059299",
            "9442171439",
            "9943089680",
            "9842720840",
            "9894340458",
            "6699669966",
            "9487531481",
            "9988442314",
            "9442271456",
            "9843039467",
            "9842258627",
            "9442368750",
            "7358965563",
            "9486586546",
            "9159500880",
            "9443031373",
            "9443129785",
            "9447775502",
            "9843030563",
            "9443039491",
            "9486023744",
            "9446422874",
            "9486394641",
            "9443046111",
            "9495144492",
            "9443523261",
            "4232258706",
            "9443061444",
            "9443031246",
            "9486188709",
            "8903911355",
            "9486671117",
            "4232230419",
            "9744991213",
            "9443360517",
            "4266279877",
            "9443560501",
            "9442084006",
            "9447749994",
            "9568094740",
            "9443367452",
            "9843433056",
            "4232231190",
            "9443522141",
            "4262220055",
            "9445062055",
            "9884407077",
            "9486861266",
            "9442621860",
            "9443375713",
            "9626106660",
            "9443330739",
            "9487790964",
            "4232284114",
            "9500799999",
            "9843464188",
            "9443208225",
            "9443032046",
            "9443069088",
            "9443524140",
            "9751015556",
            "9443031275",
            "9344703439",
            "9159811522",
            "4266271829",
            "9443022259",
            "4266276656",
            "9442790877",
            "9566000226",
            "8988968757",
            "9523964558",
            "9565786586",
            "8465210485",
            "4852145125",
            "7845478521",
            "4521045623",
            "8745127845",
            "7870870970",
            "6578978798",
            "9880559139",
            "9328664900",
            "9686098203",
            "9443532768",
            "9286509902",
            "7676461486",
            "4452369887",
            "9876543211",
            "8678687689",
            "5678687785",
            "4745743674",
            "7644765746",
            "4222223942",
            "4746478678",
            "4253221026",
            "7483687486",
            "8784758748",
            "8487576646",
            "9869071684",
            "9163209070",
            "9902775740",
            "9805509269",
            "9163565901",
            "7582446398",
            "9978605440",
            "8160488534",
            "9825150569",
            "9913545584",
            "7096103926",
            "8460075253",
            "9979869331",
            "9967356190",
            "8000010700",
            "9913257501",
            "8652147896",
            "6452052055",
            "9568234455",
            "9825070953",
            "9586313776",
            "9686301001",
            "4735747375",
            "9428759570",
            "9924142857",
            "9898573760",
            "9664928132",
            "9427488861",
            "7738566768",
            "9825607618",
            "8000454577",
            "2353454345",
            "4454487878",
            "9483632704",
            "9198244851",
            "9328941044",
            "9252613331",
            "7347265867",
            "9725462444",
            "9377775560",
            "8048762026",
            "9640681047",
            "0804532726",
            "6767675654",
            "4455653453",
            "3254365457",
            "3454535353",
            "4565768768",
            "6000000456",
            "9825618280",
            "8870539776",
            "9980966929",
            "9008893627",
            "9008893627",
            "9008893627",
            "4575879789",
            "9375690002",
            "7546465364",
            "7527825885",
            "9900102701",
            "9743332477",
            "7567914441",
            "8277759313",
            "8437983740",
            "8919918505",
            "9379563852",
            "9033234406",
            "9391027776",
            "9924539883",
            "5623426758",
            "7984789444",
            "9824246488",
            "9898549306",
            "9945093890",
            "9033263061",
            "9898036799",
            "9925915870",
            "8147207720",
            "9539759370",
            "8105406822",
            "5675755675",
            "5345353543",
            "9916825719",
            "9916820705",
            "9916825803",
            "9916825804",
            "8754512415",
            "9916825805",
            "9916825806",
            "9916825807",
            "9874563214",
            "9426010352",
            "5455454548",
            "2758588338",
            "987654321",
            "8123928832",
            "4895745675",
            "9865432156",
            "9822968560",
            "9376945281",
            "9825222974",
            "9727764162",
            "9844214809",
            "1234567000",
            "4576654765",
            "6353490407",
            "7204644670",
            "8597687878",
            "5678975479",
            "9533320451",
            "9825017683",
            "5487686586",
            "9879457348",
            "9015654810",
            "9986116064",
            "9099943748",
            "7259842876",
            "9008988972",
            "9886253247",
            "9886253247",
            "1999999999",
            "9824111711",
            "9886263247",
            "9876263247",
            "9745632145",
            "9896263247",
            "9806526604",
            "8980134919",
            "9898021557",
            "7984364706",
            "9925390085",
            "9974046274",
            "7984964206",
            "9925010205",
            "9727617201",
            "8660759817",
            "9686301013",
            "8511964939",
            "9876541323",
            "9982475566",
            "9016876311",
            "9016876311",
            "9008988972",
            "9876543690",
            "9551009510",
            "9945618246",
            "9945612645",
            "8505492565",
            "9377750505",
            "9033465616",
            "2356895632",
            "9008312615",
            "9985488594",
            "8618790263",
            "8770041250",
            "8895544650",
            "9875641236",
            "9014571186",
            "8894554656",
            "5464646464",
            "8268736286",
            "9632587412",
            "9856565562",
            "9998973304",
            "8978575222",
            "9743277007",
            "7028913593",
            "9979727410",
            "9426074833",
            "9375555456",
            "9974697906",
            "9925211307",
            "9909652024",
            "9726230628",
            "8248148427",
            "9687744545",
            "9164449169",
            "9916542164",
            "9909146777",
            "8980181614",
            "8499998866",
            "8762834323",
            "7259842876",
            "9695944893",
            "9825372977",
            "9027332421",
            "6364510371",
            "8499998866",
            "7567832899",
            "8277759000",
            "9722975964",
            "9676263289",
            "9886253247",
            "9374711585",
            "5563856695",
            "8925456818",
            "9336628793",
            "9008988972",
            "9825817785"
        ]
        const emails = [
            "sriraman1807@gmail.com",
            "anupureddy1234@gmail.com",
            "rakshisowmya@gmail.com",
            "sriraman@gmail.com",
            "sowmyat.swam@gmail.com",
            "sriraman1807@gmail.com",
            "ashu@gmail.com",
            "darsh@co.io",
            "darshan@co.io"
        ]

        // const sellers = await getAllSellerData({ /* userId */ 'mobile.mobile': { $in: mob }, userId: { $ne: null } }, {})
        const sellers = await getAllSellerData({ email: { $in: emails }, userId: { $ne: null } }, {})
        console.log("🚀 ~ seller lenth", sellers && sellers.length)
        const sellerIds = []

        if (sellers && sellers.length) {

            for (let index = 0; index < sellers.length; index++) {

                const _seller = sellers[index];
                const sellerId = _seller._id
                const mobile = _seller.mobile && _seller.mobile.length && _seller.mobile[0].mobile || null
                const email = _seller.email && _seller.email || null
                const userId = _seller.userId || null

                console.log("🚀 ~ file: testController.js ~ line 694 ~ module.exports.deleteTestDataRemaining ~ mobile", email, userId)

                if (/* mobile */ email) {
                    sellerIds.push(sellerId)
                    const productids = _seller.sellerProductId
                    console.log("-- Product ids ", productids)

                    const m_dele = await bulkDeleteMasterProducts({ _id: { $in: productids } })
                    console.log('-------- delete master---------')

                    const p_dele = await deleteSellerProducts({ _id: { $in: productids } })
                    console.log('-------- delete  Seller Products---------')

                    const delMaster1 = await deleteSellerPlans({ sellerId: sellerId });
                    console.log('-------- delete  Seller Plan---------')

                    const _sellerDel = await deleteSellerRecord({ /* 'mobile.mobile': mobile.toString() */ email: email });
                    console.log('-------- delete  Seller Data---------')

                    const _buyer = await deleteBuyer({ /* mobile: mobile.toString() */ email: email })
                    console.log('-------- delete  Buyer Data---------')

                    const investmentUrl = `http://localhost:8050/api/deleteInvesterDetails/${userId}`

                    // delete from investment
                    const respRes = await axios.post(investmentUrl, {
                        headers: {
                            'Content-Type': 'application/json',
                            // 'authorization': `ekbazaar|${token}`,
                        },
                        data: {
                            userId
                        }
                    });
                    console.log(respRes.data, ' onvestor deleted @@@@@@@@@ -------------')
                }
                console.log(index, sellers && sellers.name, ' ---- index ')
            }
        }
        console.log('--------------- delete all accounts ---------')
        respSuccess(res, sellers)

    } catch (error) {
        console.log(error, ' jjjjjjjjjjjjjjjjjjjjj')
        respError(res, error)
    }
})

module.exports.deleteTestDataChat = async (req, res) => new Promise(async (resolve, reject) => {

    try {
        console.log(' delete chat test account ---------------')
        const chatLog = await userChatLogin({ userId: "60023283293d9c7dacb6d705", username: admin.username, password: admin.password })

        console.log(chatLog, ' login ------------------')
        const mob = [
            "9377531777",
            "8654123789",
            "6546546546",
            "0000000000",
            "7633940634",
            "4666666666",
            "4547768676",
            "9785767654",
            "8870790799",
            "7876545747",
            "5656564444",
            "9877343242",
            "7676768769",
            "9743685882",
            "9691606259",
            "9797094927",
            "7796687567",
            "9099265054",
            "4498154915",
            "6000000001",
            "4687897984",
            "9476287982",
            "9817617378",
            "9761999916",
            "9997306309",
            "9864534547",
            "7895489457",
            "8998988909",
            "8946846546",
            "6547657568",
            "7643584376",
            "5465465745",
            "4576576586",
            "7249842876",
            "1122334455",
            "2398723028",
            "9845651007",
            "8277759312",
            "9876543213",
            "8277759315",
            "4565621231",
            "8277759314",
            "4564515410",
            "8312342131",
            "9442627648",
            "8723648723",
            "8652321321",
            "5645645064",
            "9533320452",
            "8091259337",
            "7852369411",
            "8765655454",
            "4564646546",
            "9999555555",
            "9345620764",
            "9905471208",
            "9665766747",
            "8989376376",
            "8776785876",
            "5555555555",
            "1122555446",
            "7898785876",
            "7847886005",
            "8888855555",
            "5443523423",
            "9889666534",
            "6756454556",
            "9500183467",
            "6567455665",
            "4676687877",
            "6564564757",
            "8888688886",
            "9686865157",
            "9738554506",
            "1654564564",
            "6873256757",
            "6754656533",
            "8610796380",
            "7897894545",
            "5456765756",
            "5675674567",
            "8885552226",
            "9686865157",
            "4768425475",
            "7675645353",
            "8277759300",
            "9883377223",
            "5478657467",
            "7657687857",
            "9035594482",
            "9486951440",
            "8765657465",
            "2635273571",
            "9686523659",
            "7879798797",
            "7975406493",
            "9533329087",
            "6309481972",
            "7887967856",
            "8798787956",
            "2323232323",
            "6786788769",
            "9576568976",
            "9488774951",
            "9443560254",
            "9842231522",
            "9442664707",
            "9159242224",
            "9443379589",
            "9442607366",
            "9442571455",
            "9843023233",
            "9586670953",
            "9786676801",
            "9750772900",
            "9747878200",
            "4232284250",
            "9442791199",
            "9787442424",
            "9840489996",
            "7667067374",
            "9442693095",
            "9442552707",
            "9442134134",
            "9486626516",
            "4262261255",
            "9486176134",
            "9486188877",
            "9443102212",
            "6325148697",
            "9443061322",
            "9442791212",
            "4266270936",
            "9446033986",
            "4232284139",
            "4266271457",
            "9442314444",
            "4232284892",
            "9443585448",
            "9442251218",
            "4262206294",
            "9487966113",
            "9842271190",
            "7698070987",
            "9442170881",
            "9442622810",
            "9443059299",
            "9442171439",
            "9943089680",
            "9842720840",
            "9894340458",
            "6699669966",
            "9487531481",
            "9988442314",
            "9442271456",
            "9843039467",
            "9842258627",
            "9442368750",
            "7358965563",
            "9486586546",
            "9159500880",
            "9443031373",
            "9443129785",
            "9447775502",
            "9843030563",
            "9443039491",
            "9486023744",
            "9446422874",
            "9486394641",
            "9443046111",
            "9495144492",
            "9443523261",
            "4232258706",
            "9443061444",
            "9443031246",
            "9486188709",
            "8903911355",
            "9486671117",
            "4232230419",
            "9744991213",
            "9443360517",
            "4266279877",
            "9443560501",
            "9442084006",
            "9447749994",
            "9568094740",
            "9443367452",
            "9843433056",
            "4232231190",
            "9443522141",
            "4262220055",
            "9445062055",
            "9884407077",
            "9486861266",
            "9442621860",
            "9443375713",
            "9626106660",
            "9443330739",
            "9487790964",
            "4232284114",
            "9500799999",
            "9843464188",
            "9443208225",
            "9443032046",
            "9443069088",
            "9443524140",
            "9751015556",
            "9443031275",
            "9344703439",
            "9159811522",
            "4266271829",
            "9443022259",
            "4266276656",
            "9442790877",
            "9566000226",
            "8988968757",
            "9523964558",
            "9565786586",
            "8465210485",
            "4852145125",
            "7845478521",
            "4521045623",
            "8745127845",
            "7870870970",
            "6578978798",
            "9880559139",
            "9328664900",
            "9686098203",
            "9443532768",
            "9286509902",
            "7676461486",
            "4452369887",
            "9876543211",
            "8678687689",
            "5678687785",
            "4745743674",
            "7644765746",
            "4222223942",
            "4746478678",
            "4253221026",
            "7483687486",
            "8784758748",
            "8487576646",
            "9869071684",
            "9163209070",
            "9902775740",
            "9805509269",
            "9163565901",
            "7582446398",
            "9978605440",
            "8160488534",
            "9825150569",
            "9913545584",
            "7096103926",
            "8460075253",
            "9979869331",
            "9967356190",
            "8000010700",
            "9913257501",
            "8652147896",
            "6452052055",
            "9568234455",
            "9825070953",
            "9586313776",
            "9686301001",
            "4735747375",
            "9428759570",
            "9924142857",
            "9898573760",
            "9664928132",
            "9427488861",
            "7738566768",
            "9825607618",
            "8000454577",
            "2353454345",
            "4454487878",
            "9483632704",
            "9198244851",
            "9328941044",
            "9252613331",
            "7347265867",
            "9725462444",
            "9377775560",
            "8048762026",
            "9640681047",
            "0804532726",
            "6767675654",
            "4455653453",
            "3254365457",
            "3454535353",
            "4565768768",
            "6000000456",
            "9825618280",
            "8870539776",
            "9980966929",
            "9008893627",
            "9008893627",
            "9008893627",
            "4575879789",
            "9375690002",
            "7546465364",
            "7527825885",
            "9900102701",
            "9743332477",
            "7567914441",
            "8277759313",
            "8437983740",
            "8919918505",
            "9379563852",
            "9033234406",
            "9391027776",
            "9924539883",
            "5623426758",
            "7984789444",
            "9824246488",
            "9898549306",
            "9945093890",
            "9033263061",
            "9898036799",
            "9925915870",
            "8147207720",
            "9539759370",
            "8105406822",
            "5675755675",
            "5345353543",
            "9916825719",
            "9916820705",
            "9916825803",
            "9916825804",
            "8754512415",
            "9916825805",
            "9916825806",
            "9916825807",
            "9874563214",
            "9426010352",
            "5455454548",
            "2758588338",
            "987654321",
            "8123928832",
            "4895745675",
            "9865432156",
            "9822968560",
            "9376945281",
            "9825222974",
            "9727764162",
            "9844214809",
            "1234567000",
            "4576654765",
            "6353490407",
            "7204644670",
            "8597687878",
            "5678975479",
            "9533320451",
            "9825017683",
            "5487686586",
            "9879457348",
            "9015654810",
            "9986116064",
            "9099943748",
            "7259842876",
            "9008988972",
            "9886253247",
            "9886253247",
            "1999999999",
            "9824111711",
            "9886263247",
            "9876263247",
            "9745632145",
            "9896263247",
            "9806526604",
            "8980134919",
            "9898021557",
            "7984364706",
            "9925390085",
            "9974046274",
            "7984964206",
            "9925010205",
            "9727617201",
            "8660759817",
            "9686301013",
            "8511964939",
            "9876541323",
            "9982475566",
            "9016876311",
            "9016876311",
            "9008988972",
            "9876543690",
            "9551009510",
            "9945618246",
            "9945612645",
            "8505492565",
            "9377750505",
            "9033465616",
            "2356895632",
            "9008312615",
            "9985488594",
            "8618790263",
            "8770041250",
            "8895544650",
            "9875641236",
            "9014571186",
            "8894554656",
            "5464646464",
            "8268736286",
            "9632587412",
            "9856565562",
            "9998973304",
            "8978575222",
            "9743277007",
            "7028913593",
            "9979727410",
            "9426074833",
            "9375555456",
            "9974697906",
            "9925211307",
            "9909652024",
            "9726230628",
            "8248148427",
            "9687744545",
            "9164449169",
            "9916542164",
            "9909146777",
            "8980181614",
            "8499998866",
            "8762834323",
            "7259842876",
            "9695944893",
            "9825372977",
            "9027332421",
            "6364510371",
            "8499998866",
            "7567832899",
            "8277759000",
            "9722975964",
            "9676263289",
            "9886253247",
            "9374711585",
            "5563856695",
            "8925456818",
            "9336628793",
            "9008988972",
            "9825817785"
        ]
        for (let index = 0; index < mob.length; index++) {
            const mobile = mob[index]
            const chatDetails = {
                mobile: mobile.toString() || '',
                token: chatLog.authToken,
                userId: chatLog.userId

            }
            const chatDelete = await deleteChatAccount(chatDetails)
            console.log(chatDelete, ' -------chat delete --------------')
        }
        console.log(' deleted all accounts --------')
        respSuccess(res, 'deleted all accounts')

    } catch (error) {
        console.log(error, ' errro ooooooo')
        respError(res, error)
    }

})


module.exports.uploadInternationalCity = async (req, res) => new Promise(async (resolve, reject) => {

    try {
        const data = req.body

        if (data && data.length) {

            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                const country = await getCountryData({ serialNo: element.countryCode.toString() })
                console.log("🚀 country------ ", country && country.name)
                const name = element.city.toLowerCase()
                console.log(name, element, ' --------------')
                const cData = {
                    name,
                    state: null,
                    country: country && country._id,
                    iso2: element && element.iso2 || null,
                    iso3: element && element.iso3 || null,
                    alias: [name]
                }
                const city = await getCity({
                    name: {
                        $regex: name, $options: 'i'
                    }
                })
                console.log(city, ' ---------------')
                if (!city) {
                    const _city = await addCity(cData)
                } else {
                    console.log(name, ' ---- Exist city ----')
                }
                console.log(index, name, '--------------- Index')
            }

        }
        respSuccess(res, 'uploaded---')

    } catch (error) {

        respError(res, error)

    }
})


module.exports.getCityList = async (req, res) => new Promise(async (resolve, reject) => {

    try {
        const list = []
        console.log(' city testing')
        let totalCount = 49742
        let limit = 200
        const ratio = totalCount / limit;
        let skip = 0;
        console.log(ratio, "ratio");
        // if (result) {
        for (skip; skip <= totalCount; skip += limit) {
            console.log(' ramesh ------------')
            const result = await getCityList({ skip, limit })

            for (let index = 0; index < result.length; index++) {
                const v = result[index];

                list.push({
                    city: v.name,
                    state: v.state && v.state.name || '',
                    country: v.country && v.country.name || ''
                })

            }
            console.log(skip, limit, ' --- total count')
        }
        // }
        const fileLocation = `public/uploads/cityListData`
        const err = await fs.writeFile(fileLocation, JSON.stringify(list))
        console.log("🚀 ~ file: testController.js ~ line 254 ~ module.exports.getCityList= ~ err", err)

        respSuccess(res, ' Exported successfully')

    } catch (error) {
        console.log(error, ' errrrr')

        respError(res, error)

    }
})


module.exports.gujaratSellerData = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log('gujarat seller date -----')
        // const data = await getAllSellerData({ "location.city": ObjectId("6058831286dcf826a46bf4ad") })
        // console.log("🚀 ~ file: testController.js ~ line 229 ~ module.exports.gujaratSellerData= ~ data", data)

        const registerdate = new Date(moment('2021-07-16').startOf('day')).toISOString()
        const date = new Date(moment().startOf('day')).toISOString()

        // const totalSellerCount = await SellerSchema.find({ $and: [/* { sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { $where: "this.sellerProductId.length > 0" }, */ { userId: { $ne: null } }], createdAt: { $gte: registerdate, $lt: date } }).populate('sellerProductId').select('name email mobile website sellerProductId hearingSource').exec()

        // const totalSellerCount = await SellerSchema.find({ name: { $regex: "rameshLive", $options: 'i' } }).populate('sellerProductId').select('name email mobile website sellerProductId createdAt').exec()
        const totalSellerCount = await getSeller('', '', { $and: [{ userId: { $ne: null } }/* , { name: { $regex: "rameshLive", $options: 'i' }} */], createdAt: { $gte: registerdate, $lt: date } })
        console.log("🚀 ~ file: testController.js ~ line 1769 ~ module.exports.gujaratSellerData= ~ totalSellerCount", totalSellerCount.length)


        let produts = []
        if (totalSellerCount && totalSellerCount.length) {
            for (let index = 0; index < totalSellerCount.length; index++) {
                let l1 = [], l1Id = [], l2 = [], l2Id = [], l3 = [], l3Id = [], l4 = [], l4Id = [], l5 = [], l5Id = [], pro_names = []
                const seller = totalSellerCount[index];

                console.log(seller.sellerProductId.length, 'aaaaaaaaaaaaaa')
                const details = seller.sellerProductId && seller.sellerProductId.length && seller.sellerProductId.map((pro) => {

                    pro.parentCategoryId && pro.parentCategoryId.length && l1.push(...pro.parentCategoryId.map((v) => v.name))
                    pro.parentCategoryId && pro.parentCategoryId.length && l1Id.push(...pro.parentCategoryId.map((v) => v.vendorId))

                    pro.primaryCategoryId && pro.primaryCategoryId.length && l2.push(...pro.primaryCategoryId.map((v) => v.name))
                    pro.primaryCategoryId && pro.primaryCategoryId.length && l2Id.push(...pro.primaryCategoryId.map((v) => v.vendorId))

                    pro.secondaryCategoryId && pro.secondaryCategoryId.length && l3.push(...pro.secondaryCategoryId.map((v) => v.name))
                    pro.secondaryCategoryId && pro.secondaryCategoryId.length && l3Id.push(...pro.secondaryCategoryId.map((v) => v.vendorId))

                    pro.poductId && pro.poductId.length && l4.push(...pro.poductId.map((v) => v.name))
                    pro.poductId && pro.poductId.length && l4Id.push(...pro.poductId.map((v) => v.vendorId))

                    pro.productSubcategoryId && pro.productSubcategoryId.length && l5.push(...pro.productSubcategoryId.map((v) => v.name))
                    pro.productSubcategoryId && pro.productSubcategoryId.length && l5Id.push(...pro.productSubcategoryId.map((v) => v.vendorId))

                    pro.productDetails && pro.productDetails.name && pro_names.push(pro.productDetails.name)


                }) || ''

                // console.log(l1, l1Id, l4, l4Id, ' ggggggggggggg')


                const qqq = {
                    name: seller.name,
                    email: seller.email,
                    hearingSource: seller.hearingSource && seller.hearingSource.source || '',
                    mobile: seller.mobile && seller.mobile.length && seller.mobile[0] && seller.mobile[0].mobile,
                    productCount: seller.sellerProductId && seller.sellerProductId.length || 0,

                    // sellerProducts: seller.sellerProductId && seller.sellerProductId.length && seller.sellerProductId.map((pro) => pro.productDetails && pro.productDetails.name || '').toString() || '',
                    sellerProductsName: _.uniq(pro_names).toString() || '',

                    level1: _.uniq(l1).toString(),
                    level1_ids: _.uniq(l1Id).toString(),

                    level2: _.uniq(l2).toString(),
                    level2_ids: _.uniq(l2Id).toString(),

                    level3: _.uniq(l3).toString(),
                    level3_ids: _.uniq(l3Id).toString(),

                    level4: _.uniq(l4).toString(),
                    level4_ids: _.uniq(l4Id).toString(),

                    level5: _.uniq(l5).toString(),
                    level5_ids: _.uniq(l5Id).toString(),

                    createdDate: seller.createdAt || '',
                }
                // console.log(JSON.stringify(qqq), ' ttttttttttttttt')
                produts.push(qqq)


            }
        }

        // const first = produts.slice(0, 1000);
        // const sec = produts.slice(1001, 2000);
        // const thr = produts.slice(2001, 3000);
        // const forth = produts.slice(3001, 4000);
        // const fifth = produts.slice(4000, 5397);
        // if (first) {
        //     // const fileLocation = `public/sellerDetailFiles/sellerProductListFirst.json`
        //     // const err = await fs.writeFile(fileLocation, JSON.stringify(first))
        //     // console.log(err, ' fffffffffffff')

        //     const FilePath = `sellerDetails-1-${new Date()}.csv`
        //     await this.csvFile(first, FilePath)
        //     console.log('11111')
        // }
        // if (sec) {
        //     // const fileLocation = `public/sellerDetailFiles/sellerProductListSecond.json`
        //     // const err = await fs.writeFile(fileLocation, JSON.stringify(sec))
        //     // console.log(err, ' ssssssssss')
        //     const FilePath = `sellerDetails-2-${new Date()}.csv`
        //     await this.csvFile(sec, FilePath)
        //     console.log('2222222')
        // }
        // if (thr) {
        //     // const fileLocation = `public/sellerDetailFiles/sellerProductListThird.json`
        //     // const err = await fs.writeFile(fileLocation, JSON.stringify(thr))
        //     // console.log(err, ' ssssssssss')
        //     const FilePath = `sellerDetails-3-${new Date()}.csv`
        //     await this.csvFile(thr, FilePath)
        //     console.log('333333333')
        // }
        // if (forth) {
        //     // const fileLocation = `public/sellerDetailFiles/sellerProductListFourth.json`
        //     // const err = await fs.writeFile(fileLocation, JSON.stringify(forth))
        //     // console.log(err, ' ssssssssss')
        //     const FilePath = `sellerDetails-4-${new Date()}.csv`
        //     await this.csvFile(forth, FilePath)
        //     console.log('4444444')
        // }
        // if (fifth) {
        //     // const fileLocation = `public/sellerDetailFiles/sellerProductListFive.json`
        //     // const err = await fs.writeFile(fileLocation, JSON.stringify(fifth))
        //     // console.log(err, ' ssssssssss')
        //     const FilePath = `sellerDetails-5-${new Date()}.csv`
        //     await this.csvFile(fifth, FilePath)
        //     console.log('5555555555')
        // }

        const FilePath = `sellerDetails-${new Date()}.csv`
        const FileSource = 'public/sellerDetailFiles/' + FilePath
        if (produts.length) {

            const csv = Papa.unparse(produts, {
                quotes: false, //or array of booleans
                quoteChar: '"',
                escapeChar: '"',
                delimiter: ",",
                header: true,
                newline: "\r\n",
                skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
                columns: null, //or array of strings
            });
            fs.writeFile(path.resolve(__dirname, '../../../public/sellerDetailFiles', FilePath), csv, (err, data) => {
                console.log(err, "Completed data", data)
            })
        }

    } catch (error) {
        console.log(error, ' gggggggggggggg')
    }
})


module.exports.csvFile = async (produts, FilePath) => {

    try {


        const csv = Papa.unparse(produts, {
            quotes: false, //or array of booleans
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ",",
            header: true,
            newline: "\r\n",
            skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
            columns: null, //or array of strings
        });
        fs.writeFile(path.resolve(__dirname, '../../../public/sellerDetailFiles', FilePath), csv, (err, data) => {
            console.log(err, "Completed data", data)
        })
    } catch (error) {
        console.log(error, ' gggggggggggggg')
    }

}

module.exports.getSellersList = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log('all sellers list from 2021-07-16 to today')
        // const data = await getAllSellerData({ "location.city": ObjectId("6058831286dcf826a46bf4ad") })
        // console.log("🚀 ~ file: testController.js ~ line 229 ~ module.exports.gujaratSellerData= ~ data", data)

        const registerdate = new Date(moment('2021-07-16').startOf('day')).toISOString()
        const date = new Date(moment().startOf('day')).toISOString()

        // const totalSellerCount = await SellerSchema.find({ $and: [/* { sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { $where: "this.sellerProductId.length > 0" }, */ { userId: { $ne: null } }], createdAt: { $gte: registerdate, $lt: date } }).populate('sellerProductId').select('name email mobile website sellerProductId hearingSource').exec()

        // const totalSellerCount = await SellerSchema.find({ name: { $regex: "rameshLive", $options: 'i' } }).populate('sellerProductId').select('name email mobile website sellerProductId createdAt').exec()
        // const totalSellerCount = await getSeller('', '', { $and: [{ userId: { $ne: null } }/* , { name: { $regex: "rameshLive", $options: 'i' }} */], createdAt: { $gte: registerdate, $lt: date } })
        const totalSellerCount = await getSellersListData('', '', { $and: [{ userId: { $ne: null } }/* , { name: { $regex: "rameshLive", $options: 'i' }} */], createdAt: { $gte: registerdate, $lt: date } })

        console.log(totalSellerCount, "totalSeller Data");
        console.log("🚀 ~ file: testController.js ~ line 1769 ~ module.exports.gujaratSellerData= ~ totalSellerCount", totalSellerCount.length)

        let produts = []
        if (totalSellerCount && totalSellerCount.length) {
            for (let index = 0; index < totalSellerCount.length; index++) {
                let l1 = [], l1Id = [], l2 = [], l2Id = [], l3 = [], l3Id = [], l4 = [], l4Id = [], l5 = [], l5Id = [], pro_names = []
                const seller = totalSellerCount[index];

                console.log(seller.sellerProductId && seller.sellerProductId.length, 'aaaaaaaaaaaaaa')
                console.log(seller && seller.sellerType && seller.sellerType[0] && seller.sellerType[0].name, 'Seller Data');

                const details = seller.sellerProductId && seller.sellerProductId.length && seller.sellerProductId.map((pro) => {

                    pro.parentCategoryId && pro.parentCategoryId.length && l1.push(...pro.parentCategoryId.map((v) => v.name))
                    pro.parentCategoryId && pro.parentCategoryId.length && l1Id.push(...pro.parentCategoryId.map((v) => v.vendorId))

                    pro.primaryCategoryId && pro.primaryCategoryId.length && l2.push(...pro.primaryCategoryId.map((v) => v.name))
                    pro.primaryCategoryId && pro.primaryCategoryId.length && l2Id.push(...pro.primaryCategoryId.map((v) => v.vendorId))

                    pro.secondaryCategoryId && pro.secondaryCategoryId.length && l3.push(...pro.secondaryCategoryId.map((v) => v.name))
                    pro.secondaryCategoryId && pro.secondaryCategoryId.length && l3Id.push(...pro.secondaryCategoryId.map((v) => v.vendorId))

                    pro.poductId && pro.poductId.length && l4.push(...pro.poductId.map((v) => v.name))
                    pro.poductId && pro.poductId.length && l4Id.push(...pro.poductId.map((v) => v.vendorId))

                    pro.productSubcategoryId && pro.productSubcategoryId.length && l5.push(...pro.productSubcategoryId.map((v) => v.name))
                    pro.productSubcategoryId && pro.productSubcategoryId.length && l5Id.push(...pro.productSubcategoryId.map((v) => v.vendorId))

                    pro.productDetails && pro.productDetails.name && pro_names.push(pro.productDetails.name)


                }) || ''

                // console.log(l1, l1Id, l4, l4Id, ' ggggggggggggg')

                const qqq = {
                    name: seller.name,
                    email: seller.email,
                    hearingSource: seller.hearingSource && seller.hearingSource.source || '',
                    mobile: seller.mobile && seller.mobile.length && seller.mobile[0] && seller.mobile[0].mobile,
                    productCount: seller.sellerProductId && seller.sellerProductId.length || 0,
                    sellerType: seller && seller.sellerType && seller.sellerType[0] && seller.sellerType[0].name,

                    city: seller && seller.location && seller.location.city && seller.location.city.name,
                    state: seller && seller.location && seller.location.state && seller.location.state.name,
                    // sellerType: seller.sellerType && seller.sellerType[0] && seller.sellerType[0].name || '',

                    // sellerProducts: seller.sellerProductId && seller.sellerProductId.length && seller.sellerProductId.map((pro) => pro.productDetails && pro.productDetails.name || '').toString() || '',
                    sellerProductsName: _.uniq(pro_names).toString() || '',

                    level1: _.uniq(l1).toString(),
                    level1_ids: _.uniq(l1Id).toString(),

                    level2: _.uniq(l2).toString(),
                    level2_ids: _.uniq(l2Id).toString(),

                    level3: _.uniq(l3).toString(),
                    level3_ids: _.uniq(l3Id).toString(),

                    level4: _.uniq(l4).toString(),
                    level4_ids: _.uniq(l4Id).toString(),

                    level5: _.uniq(l5).toString(),
                    level5_ids: _.uniq(l5Id).toString(),

                    createdDate: seller.createdAt || '',
                }
                // console.log(JSON.stringify(qqq), ' ttttttttttttttt')
                produts.push(qqq)


            }
        }

        // const FilePath = `sellerDetails-${new Date()}.csv`
        const FilePath = `sellerDetails-list-${new Date()}.csv`
        const FileSource = 'public/sellerDetailFiles/' + FilePath

        console.log(produts.length, "produts.length");
        if (produts.length) {

            const csv = Papa.unparse(produts, {
                quotes: false, //or array of booleans
                quoteChar: '"',
                escapeChar: '"',
                delimiter: ",",
                header: true,
                newline: "\r\n",
                skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
                columns: null, //or array of strings
            });
            fs.writeFile(path.resolve(__dirname, '../../../public/sellerDetailFiles', FilePath), csv, (err, data) => {
                console.log(err, "Completed data", data)
            })
        }

    } catch (error) {
        console.log(error, ' gggggggggggggg')
    }
  })
