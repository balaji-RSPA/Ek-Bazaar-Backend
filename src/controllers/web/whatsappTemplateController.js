const {Whatsapp} = require('../../modules');

const { createWhatsaapTemplate, getSingleTemplateById } = Whatsapp;

const {
    respSuccess,
    respError
} = require('../../utils/respHadler');

const {sendWhatsappMassage} = require('../../utils/utils')


module.exports.whatsappTempCreate = async (req, res) => {
    try{
        let temp = req.body
        let createdTemplates = await createWhatsaapTemplate(temp)
        console.log(createdTemplates,"🚀 ~ file: whatsappTemplateController.js:14 ~ module.exports.whatsappTempCreate= ~ temp:", temp)

        respSuccess(res,createdTemplates,"Whatsapp Templates is created");
        
    }catch (error){
        console.log("🚀 ~ file: whatsappTemplateController.js:22 ~ module.exports.whatsappTempCreate= ~ error:", error)
        // console.log("🚀 ~ file: whatsappTemplateController.js:10 ~ module.exports.whatsappTempCreate= ~ error:", error)
        respError(res, error.message)
    }
}

module.exports.sendWhatsaapWelcome = async (data) => new Promise(async (resolve, reject) => {
    let template_id = "04570ab5-e458-4e53-b394-b8e08e9c130b";

    let userTemplate = await getSingleTemplateById({ template_id })
    // console.log("=====================Whatsaap Template User==================", userTemplate)

    let { receiver_number, first_name, dynamicname, website } = data;

    
    data.template_id = template_id;
    data.client_number = userTemplate.client_number

    console.log("🚀 ############################ sendWhatsaapWelcome Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:47 ~ module.exports.sendWhatsaapWelcome= ~ error:", error.message)
            reject(error.message)
        })
})

module.exports.setLanguageWhatsapp = async (data) => new Promise(async (resolve, reject) => {
    let template_id = "4ba96314-b2ec-485a-966b-d4814f2073f6";
    let client_number = "917483902919"


    let userTemplate = await getSingleTemplateById({ template_id })
    // console.log("=====================Whatsaap Template User==================", userTemplate)

    let { receiver_number, first_name, dynamicname, website } = data;


    data.template_id = template_id;
    data.client_number = userTemplate.client_number

    console.log("🚀 ############################ setLanguageWhatsapp Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:75 ~ module.exports.setLanguageWhatsapp= ~ error:", error.message)
            // console.log("🚀 ~ file: whatsappTemplateController.js:40 ~ module.exports.sendWelcome= ~ error:", error, error.message)
            reject(error.message)
        })
})

module.exports.completeProfileWhatsapp = async (data) => new Promise(async (resolve, reject) => {
    let template_id = "cd663107-376-4764-8345-afc67ae24fef";
    let client_number = "917483902919"


    let userTemplate = await getSingleTemplateById({ template_id })
    // console.log("=====================Whatsaap Template User==================", userTemplate)

    let { receiver_number, first_name, dynamicname, website } = data;


    data.template_id = template_id;
    data.client_number = userTemplate.client_number

    console.log("🚀 ############################ completeProfileWhatsapp Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:103 ~ module.exports.completeProfileWhatsapp ~ error:", error.message)
            // console.log("🚀 ~ file: whatsappTemplateController.js:40 ~ module.exports.sendWelcome= ~ error:", error, error.message)
            reject(error.message)
        })
})

module.exports.onCompleteProfileWhatsapp = async (data) => new Promise(async (resolve, reject) => {
    let template_id = "9f947f22-6be5-48c8-826e-d185a817fa99";
    let client_number = "917483902919"


    let userTemplate = await getSingleTemplateById({ template_id })
    // console.log("=====================Whatsaap Template User==================", userTemplate)

    let { receiver_number, first_name, dynamicname, website } = data;


    data.template_id = template_id;
    data.client_number = userTemplate.client_number

    console.log("🚀 ############################ onCompleteProfileWhatsapp Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:131 ~ module.exports.onCompleteProfileWhatsapp ~ error:", error.message)
            // console.log("🚀 ~ file: whatsappTemplateController.js:40 ~ module.exports.sendWelcome= ~ error:", error, error.message)
            reject(error.message)
        })
})

module.exports.toAddProductWhatsapp = async (data) => new Promise(async (resolve, reject) => {
    let template_id = "8655fa67-03d0-4213-bfbd-08f1327c4bb5";
    let client_number = "917483902919"


    let userTemplate = await getSingleTemplateById({ template_id })
    // console.log("=====================Whatsaap Template User==================", userTemplate)

    let { receiver_number, first_name, dynamicname, website } = data;


    data.template_id = template_id;
    data.client_number = userTemplate.client_number

    console.log("🚀 ############################ toAddProductWhatsapp Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:159 ~ module.exports.toAddProductWhatsapp= ~ error:", error.message)
            // console.log("🚀 ~ file: whatsappTemplateController.js:40 ~ module.exports.sendWelcome= ~ error:", error, error.message)
            reject(error.message)
        })
})

module.exports.addProductReminderWhatsapp = async (data) => new Promise(async (resolve, reject) => {
    let template_id = "395c0ff9-91f0-4149-b911-0e95b4189eaa";
    let client_number = "917483902919"


    let userTemplate = await getSingleTemplateById({ template_id })
    // console.log("=====================Whatsaap Template User==================", userTemplate)

    // let { receiver_number, first_name, dynamicname, website } = data;


    data.template_id = template_id;
    data.client_number = userTemplate.client_number

    console.log("🚀 ############################ addProductReminderWhatsapp Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:187 ~ module.exports.addProductReminderWhatsapp= ~ error:", error.message)
            // console.log("🚀 ~ file: whatsappTemplateController.js:40 ~ module.exports.sendWelcome= ~ error:", error, error.message)
            reject(error.message)
        })
})
