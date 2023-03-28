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

    console.log("🚀 ############################Final Data########################", data)

    sendWhatsappMassage(data)
        .then((res) => {
            // console.log(" %%%%%%%%%%%%%%%%%Responce ----------", res)
            resolve(res)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplateController.js:40 ~ module.exports.sendWelcome= ~ error:", error,error.message)
            reject(error.message)
        })
})
