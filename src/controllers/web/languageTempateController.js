const { respSuccess, respError } = require("../../utils/respHadler");
const { LanguageTemplate, category } = require("../../modules");
const { getlevel3Cat, updateSecondaryCategory } = category
const { createLanguageTemplate, getChatAllTemplates, getChatTemplate, updateLanguageTemplate } = LanguageTemplate

module.exports.uploadChatLanguageCategory = async (req, res) => {
    try {
        const data = req.body
        if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
                const cat = data[i]
                console.log("🚀 ~ file: languageTempateController.js ~ line 12 ~ module.exports.uploadChatLanguageCategory= ~ cat", cat)
                const catDetails = await getlevel3Cat({ name: { $regex: cat.Category, $options: 'i' } })
                if (catDetails) {
                    const que = {
                        name: cat.Category,
                        l1: catDetails && catDetails.primaryCatId && catDetails.primaryCatId.parentCatId && catDetails.primaryCatId.parentCatId._id || '',
                        l2: catDetails && catDetails.primaryCatId && catDetails.primaryCatId && catDetails.primaryCatId._id || "",
                        l3: catDetails && catDetails._id || '',

                        categoryNames: {
                            "en": cat.English.trim() || "",
                            "mr": cat.Marathi.trim() || "",
                            "gu": cat.Gujarati.trim() || "",
                            "bn": cat.Bengali.trim() || "",
                            "kn": cat.Kannada.trim() || "",
                            "te": cat.Telugu.trim() || "",
                            "as": cat.Assamese && cat.Assamese.trim() || "",
                            "ta": cat.Tamil.trim() || "",
                            "ml": cat.Malayalam.trim() || "",
                            "hi": cat.Hindi.trim() || "",
                        },
                        questions: {
                            "en": [],
                            "mr": [],
                            "gu": [],
                            "bn": [],
                            "kn": [],
                            "te": [],
                            "as": [],
                            "ta": [],
                            "ml": [],
                            "hi": [],
                        }

                    }
                    const temp = await createLanguageTemplate(que)
                    if (temp) {
                        const l3 = await updateSecondaryCategory(catDetails._id, { chatTempateId: temp._id })
                    }
                }
            }
        } else {
            console.log(' NO data')
        }

        respSuccess(res, ' data uploaded ')

    } catch (error) {
        console.log(error, ' rrrrrrrrrrrrrrrrrrrrrrrrrr')
        respError(res, error)
    }
}

module.exports.uploadChatLanguageQuestions = async (req, res) => {
    try {
        const data = req.body
        if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
                const cat = data[i]
                if (cat && cat.Category) {

                    const catDetails = await getChatTemplate({ name: { $regex: cat.Category, $options: 'i' } })
                    console.log(catDetails, ' records ------------------')
                    let English = [], Marathi = [], Gujarati = [], Bengali = [], Kannada = [], Telugu = [], Assamese = [], Tamil = [], Malayalam = [], Hindi = []

                    if (catDetails) {
                        const oldQue = catDetails.questions
                        English.push(cat.English.trim())
                        Marathi.push(cat.Marathi.trim())
                        Gujarati.push(cat.Gujarati.trim())
                        Bengali.push(cat.Bengali.trim())
                        Kannada.push(cat.Kannada.trim())
                        Telugu.push(cat.Telugu.trim())
                        // Assamese.push(cat.Assamese.trim())
                        Tamil.push(cat.Tamil.trim())
                        Malayalam.push(cat.Malayalam.trim())
                        Hindi.push(cat.Hindi.trim())
                        const question = {
                            "en": [...oldQue['en'], ...English],
                            "mr": [...oldQue['mr'], ...Marathi],
                            "gu": [...oldQue['gu'], ...Gujarati],
                            "bn": [...oldQue['bn'], ...Bengali],
                            "kn": [...oldQue['kn'], ...Kannada],
                            "te": [...oldQue['te'], ...Telugu],
                            "as": /* [...oldQue['as'], ...Assamese] */[],
                            "ta": [...oldQue['ta'], ...Tamil],
                            "ml": [...oldQue['ml'], ...Malayalam],
                            "hi": [...oldQue['hi'], ...Hindi],
                        }
                        const data = {
                            // ...catDetails,
                            questions: question

                        }
                        const temp = await updateLanguageTemplate({ _id: catDetails._id }, data)
                        // console.log(data, temp, ' gggggggggggggggggggggg')
                    }
                }
            }
        } else {
            console.log(' NO data')
        }

        respSuccess(res, ' Questions data uploaded ')

    } catch (error) {
        console.log(error)
        respError(res, error)
    }
}

module.exports.getAllChatTemplates = async (req, res) => {
    try {
        const { skip, limit } = req.query
        const query = {}
        const result = await getChatAllTemplates(query, { skip: parseInt(skip), limit: parseInt(limit) })
        respSuccess(res, result)
    } catch (error) {
        console.log(error)
        respError(res, error)
    }
}

module.exports.getChatTemplate = async (req, res) => {
    try {
        const { id } = req.params
        const query = {
            l3: id
        }
        const result = await getChatTemplate(query)
        const data = await getChatAllTemplates(query, { skip: 0, limit: 5 })
        const final = [result, ...data]
        respSuccess(res, final)
    } catch (error) {
        console.log(error)
        respError(res, error)
    }
}