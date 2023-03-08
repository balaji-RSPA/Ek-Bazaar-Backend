const { respSuccess, respError } = require("../../utils/respHadler");
const {
  LanguageTemplate,
  category,
  LanguageTemplateOne,
} = require("../../modules");
const { oneBazaarRequestOrigin } = require("../../utils/globalConstants");
const { getlevel3Cat, updateSecondaryCategory, getProductByQuery, findAndUpdate, getSubCatProductByQuery, findAndUpdatel5 } = category;
const {
  createLanguageTemplate,
  createLanguageTemplateL4,
  createLanguageTemplateL5,
  getChatAllTemplates,
  getL4ChatAllTemplates,
  getL5ChatAllTemplates,
  getChatTemplate,
  getL4ChatTemplate,
  getL5ChatTemplate,
  updateLanguageTemplate,
  updateL4LanguageTemplate,
  updateL5LanguageTemplate,
} = LanguageTemplate;
const {
  createLanguageTemplateOne,
  createLanguageTemplateL4One,
  createLanguageTemplateL5One,
  getChatAllTemplatesOne,
  getL4ChatAllTemplatesOne,
  getL5ChatAllTemplatesOne,
  getChatTemplateOne,
  getL4ChatTemplateOne,
  getL5ChatTemplateOne,
  updateLanguageTemplateOne,
  updateL4LanguageTemplateOne,
  updateL5LanguageTemplateOne,
} = LanguageTemplateOne;

module.exports.uploadChatLanguageCategory = async (req, res) => {
  try {
    const data = req.body;
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];
        console.log(
          "🚀 ~ file: languageTempateController.js ~ line 12 ~ module.exports.uploadChatLanguageCategory= ~ cat",
          cat
        );
        const catDetails = await getlevel3Cat({
          name: { $regex: cat.Category, $options: "i" },
        });
        if (catDetails) {
          const que = {
            name: cat.Category,
            l1:
              (catDetails &&
                catDetails.primaryCatId &&
                catDetails.primaryCatId.parentCatId &&
                catDetails.primaryCatId.parentCatId._id) ||
              "",
            l2:
              (catDetails &&
                catDetails.primaryCatId &&
                catDetails.primaryCatId &&
                catDetails.primaryCatId._id) ||
              "",
            l3: (catDetails && catDetails._id) || "",

            categoryNames: {
              en: cat.English.trim() || "",
              mr: cat.Marathi.trim() || "",
              gu: cat.Gujarati.trim() || "",
              bn: cat.Bengali.trim() || "",
              kn: cat.Kannada.trim() || "",
              te: cat.Telugu.trim() || "",
              as: (cat.Assamese && cat.Assamese.trim()) || "",
              ta: cat.Tamil.trim() || "",
              ml: cat.Malayalam.trim() || "",
              hi: cat.Hindi.trim() || "",
            },
            questions: {
              en: [],
              mr: [],
              gu: [],
              bn: [],
              kn: [],
              te: [],
              as: [],
              ta: [],
              ml: [],
              hi: [],
            },
          };
          const temp = await createLanguageTemplate(que);
          if (temp) {
            const l3 = await updateSecondaryCategory(catDetails._id, {
              chatTempateId: temp._id,
            });
          }
        }
      }
    } else {
      console.log(" NO data");
    }

    respSuccess(res, " data uploaded ");
  } catch (error) {
    console.log(error, " rrrrrrrrrrrrrrrrrrrrrrrrrr");
    respError(res, error);
  }
};

module.exports.uploadL4ChatLanguageTemplate = async (req, res) => {
  try {
    const data = req.body;
    let finalRes = { temp: [], l4: [] }
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];
        let catDetails = await getProductByQuery({ vendorId: cat.vendorId })
        // console.log(cat, '-------------cat-----------');

        if (catDetails) {
          const que = {
            name: cat.English,
            l1:
              (catDetails &&
                catDetails.secondaryId &&
                catDetails.secondaryId.primaryCatId &&
                catDetails.secondaryId.primaryCatId.parentCatId &&
                catDetails.secondaryId.primaryCatId.parentCatId._id) ||
              "",
            l2:
              (catDetails &&
                catDetails.secondaryId &&
                catDetails.secondaryId.primaryCatId &&
                catDetails.secondaryId.primaryCatId._id) ||
              "",
            l3: (catDetails &&
              catDetails.secondaryId &&
              catDetails.secondaryId._id) || "",

            l4: (catDetails && catDetails._id) || "",

            categoryNames: {
              en: cat.English.trim() || "",
              mr: cat.Marathi.trim() || "",
              gu: cat.Gujarati.trim() || "",
              bn: cat.Bengali.trim() || "",
              kn: cat.Kannada.trim() || "",
              te: cat.Telugu.trim() || "",
              as: (cat.Assamese && cat.Assamese.trim()) || "",
              ta: cat.Tamil.trim() || "",
              ml: cat.Malayalam.trim() || "",
              hi: cat.Hindi.trim() || "",
            },
            questions: {
              en: [],
              mr: [],
              gu: [],
              bn: [],
              kn: [],
              te: [],
              as: [],
              ta: [],
              ml: [],
              hi: [],
            },
          };

          console.log(que, "----------------quequequequequequeque")

          const temp = await createLanguageTemplateL4(que);
          finalRes.temp.push(temp._id);

          if (temp) {
            const l4 = await findAndUpdate({ _id: catDetails._id }, { chatTempateId: temp._id, })
            finalRes.l4.push(l4)
          }
        }
      }

      respSuccess(res, finalRes)
    }
  } catch (error) {
    console.log(error, " rrrrrrrrrrrrrrrrrrrrrrrrrr");
    respError(res, error);
  }

}

module.exports.uploadeL5ChatLanguageTemplate = async (req, res) => {
  try {
    let data = req.body;
    let finalRes = { temp: [], l5: [] }
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];
        let catDetails = await getSubCatProductByQuery({ vendorId: cat.vendorId })
        if (catDetails) {
          const que = {
            name: cat.English,
            l1: (catDetails &&
              catDetails.productId &&
              catDetails.productId.secondaryId &&
              catDetails.productId.secondaryId.primaryCatId &&
              catDetails.productId.secondaryId.primaryCatId.parentCatId &&
              catDetails.productId.secondaryId.primaryCatId.parentCatId._id) || '',
            l2: (catDetails &&
              catDetails.productId &&
              catDetails.productId.secondaryId &&
              catDetails.productId.secondaryId.primaryCatId &&
              catDetails.productId.secondaryId.primaryCatId._id) || '',
            l3: (catDetails &&
              catDetails.productId &&
              catDetails.productId.secondaryId &&
              catDetails.productId.secondaryId._id) || '',
            l4: (catDetails &&
              catDetails.productId &&
              catDetails.productId._id) || '',
            l5: (catDetails && catDetails._id) || '',

            categoryNames: {
              en: cat.English.trim() || "",
              mr: cat.Marathi.trim() || "",
              gu: cat.Gujarati.trim() || "",
              bn: cat.Bengali.trim() || "",
              kn: cat.Kannada.trim() || "",
              te: cat.Telugu.trim() || "",
              as: (cat.Assamese && cat.Assamese.trim()) || "",
              ta: cat.Tamil.trim() || "",
              ml: cat.Malayalam.trim() || "",
              hi: cat.Hindi.trim() || "",
            },
            questions: {
              en: [],
              mr: [],
              gu: [],
              bn: [],
              kn: [],
              te: [],
              as: [],
              ta: [],
              ml: [],
              hi: [],
            }
          }
          const temp = await createLanguageTemplateL5(que);
          console.log("🚀 ~ file: languageTempateController.js:237 ~ module.exports.uploadeL5ChatLanguageTemplate= ~ temp", temp)
          finalRes.temp.push(temp._id);

          if (temp) {
            const l5 = await findAndUpdatel5({ _id: catDetails._id }, { chatTempateId: temp._id, })
            finalRes.l5.push(l5)
          }
        }
      }
      respSuccess(res, finalRes)
    } else {
      console.log("*************No Data avilable***************");
    }
  } catch (error) {
    console.log(error, " rrrrrrrrrrrrrrrrrrrrrrrrrr");
    respError(res, error);
  }
}

module.exports.uploadeL5ChatLanguageTemplateOne = async (req, res) => {
  try {
    let data = req.body;
    let finalRes = { temp: [], l5: [] }
    console.log("🚀 ~ file: languageTempateController.js:271 ~ module.exports.uploadeL5ChatLanguageTemplateOne= ~ data:", data)
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];
        let catDetails = await getSubCatProductByQuery({ vendorId: cat.vendorId })
        console.log("🚀 ~ file: languageTempateController.js:275 ~ module.exports.uploadeL5ChatLanguageTemplateOne= ~ catDetails:", catDetails)
        if (catDetails) {
          const que = {
            name: cat.English,
            l1: (catDetails &&
              catDetails.productId &&
              catDetails.productId.secondaryId &&
              catDetails.productId.secondaryId.primaryCatId &&
              catDetails.productId.secondaryId.primaryCatId.parentCatId &&
              catDetails.productId.secondaryId.primaryCatId.parentCatId._id) || '',
            l2: (catDetails &&
              catDetails.productId &&
              catDetails.productId.secondaryId &&
              catDetails.productId.secondaryId.primaryCatId &&
              catDetails.productId.secondaryId.primaryCatId._id) || '',
            l3: (catDetails &&
              catDetails.productId &&
              catDetails.productId.secondaryId &&
              catDetails.productId.secondaryId._id) || '',
            l4: (catDetails &&
              catDetails.productId &&
              catDetails.productId._id) || '',
            l5: (catDetails && catDetails._id) || '',

            categoryNames: {
              en: cat.English.trim() || "",
              sw: cat.Swahili.trim() || "",
              zu: cat.Zulu.trim() || ""
              // mr: cat.Marathi.trim() || "",
              // gu: cat.Gujarati.trim() || "",
              // bn: cat.Bengali.trim() || "",
              // kn: cat.Kannada.trim() || "",
              // te: cat.Telugu.trim() || "",
              // as: (cat.Assamese && cat.Assamese.trim()) || "",
              // ta: cat.Tamil.trim() || "",
              // ml: cat.Malayalam.trim() || "",
              // hi: cat.Hindi.trim() || "",
            },
            questions: {
              en: [],
              sw: [],
              zu: []
              // mr: [],
              // gu: [],
              // bn: [],
              // kn: [],
              // te: [],
              // as: [],
              // ta: [],
              // ml: [],
              // hi: [],
            }
          }

          console.log(que,"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
          const temp = await createLanguageTemplateL5One(que);
          console.log("🚀 ~ file: languageTempateController.js:237 ~ module.exports.uploadeL5ChatLanguageTemplate= ~ temp", temp)
          finalRes.temp.push(temp._id);

          if (temp) {
            const l5 = await findAndUpdatel5({ _id: catDetails._id }, { chatTempateId: temp._id, })
            finalRes.l5.push(l5)
          }
        }
      }
      respSuccess(res, finalRes)
    } else {
      console.log("*************No Data avilable***************");
    }
  } catch (error) {
    console.log(error, " rrrrrrrrrrrrrrrrrrrrrrrrrr");
    respError(res, error);
  }
}

module.exports.uploadChatLanguageCategoryOne = async (req, res) => {
  try {
    const data = req.body;
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];

        // console.log("🚀 ~ file: languageTempateController.js ~ line 12 ~ module.exports.uploadChatLanguageCategory= ~ cat", cat)
        const catDetails = await getlevel3Cat({
          name: { $regex: cat.Category, $options: "i" },
        });

        if (catDetails) {
          console.log(catDetails, "catDetails");
          console.log(cat.Category, "cat.Category");

          const que = {
            name: cat.Category,
            l1:
              (catDetails &&
                catDetails.primaryCatId &&
                catDetails.primaryCatId.parentCatId &&
                catDetails.primaryCatId.parentCatId._id) ||
              "",
            l2:
              (catDetails &&
                catDetails.primaryCatId &&
                catDetails.primaryCatId &&
                catDetails.primaryCatId._id) ||
              "",
            l3: (catDetails && catDetails._id) || "",

            categoryNames: {
              en: cat.Category.trim() || "",
              nl: cat.Dutch.trim() || "",
              ar: cat.Arabic.trim() || "",
              ko: cat.Korean.trim() || "",
              vi: cat.Vietnamese.trim() || "",
              tr: cat.Turkish.trim() || "",
              jv: cat.Javanese.trim() || "",
              fa: cat.Persian.trim() || "",
              ms: cat.Malay.trim() || "",
              th: cat.Thai.trim() || "",
              de: cat.German.trim() || "",
              pl: cat.Polish.trim() || "",
              fr: cat.French.trim() || "",
              "zh-CN": cat.Chinese.trim() || "",
              pt: cat.Portuguese.trim() || "",
              es: cat.Spanish.trim() || "",
              it: cat.Italian.trim() || "",
            },
            questions: {
              en: [],
              nl: [],
              ar: [],
              ko: [],
              vi: [],
              tr: [],
              jv: [],
              fa: [],
              ms: [],
              th: [],
              de: [],
              pl: [],
              fr: [],
              "zh-CN": [],
              pt: [],
              es: [],
              it: [],
            },
          };

          const temp = await createLanguageTemplateOne(que);
          if (temp) {
            const l3 = await updateSecondaryCategory(catDetails._id, {
              chatTempateOneId: temp._id,
            });
          }
        }
      }
    } else {
      console.log(" NO data");
    }

    respSuccess(res, " data uploaded ");
  } catch (error) {
    console.log(error, " rrrrrrrrrrrrrrrrrrrrrrrrrr");
    respError(res, error);
  }
};

module.exports.uploadL4ChatLanguageTemplateOne = async (req, res) => {
  try {
    const data = req.body;
    let finalRes = { temp: [], l4: [] }
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];
        let catDetails = await getProductByQuery({ vendorId: cat.vendorId })
        // console.log(cat, '-------------cat-----------');

        if (catDetails) {
          const que = {
            name: cat.English,
            l1:
              (catDetails &&
                catDetails.secondaryId &&
                catDetails.secondaryId.primaryCatId &&
                catDetails.secondaryId.primaryCatId.parentCatId &&
                catDetails.secondaryId.primaryCatId.parentCatId._id) ||
              "",
            l2:
              (catDetails &&
                catDetails.secondaryId &&
                catDetails.secondaryId.primaryCatId &&
                catDetails.secondaryId.primaryCatId._id) ||
              "",
            l3: (catDetails &&
              catDetails.secondaryId &&
              catDetails.secondaryId._id) || "",

            l4: (catDetails && catDetails._id) || "",

            categoryNames: {
              en: cat.English.trim() || "",
              sw: cat.Swahili.trim() || "",
              zu: cat.Zulu.trim() || "",
              // bn: cat.Bengali.trim() || "",
              // kn: cat.Kannada.trim() || "",
              // te: cat.Telugu.trim() || "",
              // as: (cat.Assamese && cat.Assamese.trim()) || "",
              // ta: cat.Tamil.trim() || "",
              // ml: cat.Malayalam.trim() || "",
              // hi: cat.Hindi.trim() || "",
            },
            questions: {
              en: [],
              sw: [],
              zu: [],
              // bn: [],
              // kn: [],
              // te: [],
              // as: [],
              // ta: [],
              // ml: [],
              // hi: [],
            },
          };

          console.log(que, "----------------quequequequequequeque")

          const temp = await createLanguageTemplateL4One(que);
          finalRes.temp.push(temp._id);

          if (temp) {
            const l4 = await findAndUpdate({ _id: catDetails._id }, { chatTempateId: temp._id, })
            finalRes.l4.push(l4)
          }
        }
      }

      respSuccess(res, finalRes)
    }
  } catch (error) {
    console.log(error, " rrrrrrrrrrrrrrrrrrrrrrrrrr");
    respError(res, error);
  }

}

module.exports.uploadChatLanguageQuestions = async (req, res) => {
  try {
    const data = req.body;
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];
        if (cat && cat.Category) {
          const catDetails = await getChatTemplate({
            name: { $regex: cat.Category, $options: "i" },
          });
          console.log(catDetails, " records ------------------");
          let English = [],
            Marathi = [],
            Gujarati = [],
            Bengali = [],
            Kannada = [],
            Telugu = [],
            Assamese = [],
            Tamil = [],
            Malayalam = [],
            Hindi = [];

          if (catDetails) {
            const oldQue = catDetails.questions;
            English.push(cat.English.trim());
            Marathi.push(cat.Marathi.trim());
            Gujarati.push(cat.Gujarati.trim());
            Bengali.push(cat.Bengali.trim());
            Kannada.push(cat.Kannada.trim());
            Telugu.push(cat.Telugu.trim());
            // Assamese.push(cat.Assamese.trim())
            Tamil.push(cat.Tamil.trim());
            Malayalam.push(cat.Malayalam.trim());
            Hindi.push(cat.Hindi.trim());
            const question = {
              en: [...oldQue["en"], ...English],
              mr: [...oldQue["mr"], ...Marathi],
              gu: [...oldQue["gu"], ...Gujarati],
              bn: [...oldQue["bn"], ...Bengali],
              kn: [...oldQue["kn"], ...Kannada],
              te: [...oldQue["te"], ...Telugu],
              as: /* [...oldQue['as'], ...Assamese] */[],
              ta: [...oldQue["ta"], ...Tamil],
              ml: [...oldQue["ml"], ...Malayalam],
              hi: [...oldQue["hi"], ...Hindi],
            };
            const data = {
              // ...catDetails,
              questions: question,
            };
            const temp = await updateLanguageTemplate(
              { _id: catDetails._id },
              data
            );
            // console.log(data, temp, ' gggggggggggggggggggggg')
          }
        }
      }
    } else {
      console.log(" NO data");
    }

    respSuccess(res, " Questions data uploaded ");
  } catch (error) {
    console.log(error);
    respError(res, error);
  }
};

module.exports.uploadL4ChatLanguageQuestions = async (req, res) => {
  let data = req.body;

  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      const cat = data[i];

      if (cat && cat.Category) {
        const catDetails = await getL4ChatTemplate({
          name: { $regex: cat.Category, $options: "i" },
        });

        let English = [],
          Marathi = [],
          Gujarati = [],
          Bengali = [],
          Kannada = [],
          Telugu = [],
          Assamese = [],
          Tamil = [],
          Malayalam = [],
          Hindi = [];

        if (catDetails) {
          const oldQue = catDetails.questions;
          English.push(cat.English.trim());
          Marathi.push(cat.Marathi.trim());
          Gujarati.push(cat.Gujarati.trim());
          Bengali.push(cat.Bengali.trim());
          Kannada.push(cat.Kannada.trim());
          Telugu.push(cat.Telugu.trim());
          // Assamese.push(cat.Assamese.trim())
          Tamil.push(cat.Tamil.trim());
          Malayalam.push(cat.Malayalam.trim());
          Hindi.push(cat.Hindi.trim());
          const question = {
            en: [...oldQue["en"], ...English],
            mr: [...oldQue["mr"], ...Marathi],
            gu: [...oldQue["gu"], ...Gujarati],
            bn: [...oldQue["bn"], ...Bengali],
            kn: [...oldQue["kn"], ...Kannada],
            te: [...oldQue["te"], ...Telugu],
            as: /* [...oldQue['as'], ...Assamese] */[],
            ta: [...oldQue["ta"], ...Tamil],
            ml: [...oldQue["ml"], ...Malayalam],
            hi: [...oldQue["hi"], ...Hindi],
          };
          const data = {
            // ...catDetails,
            questions: question,
          };
          console.log(data, " records ------------------", cat.Category);
          const temp = await updateL4LanguageTemplate(
            { _id: catDetails._id },
            data
          );
          // console.log(data, temp, ' gggggggggggggggggggggg')
        }
      }
    }
  } else {
    console.log(" No data")
  }
}

module.exports.uploadL5ChatLanguageQuestions = async (req, res) => {
  try {
    let data = req.body;

    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];

        if (cat && cat.Category) {
          const catDetails = await getL5ChatTemplate({
            name: { $regex: cat.Category, $options: "i" },
          });

          let English = [],
            Marathi = [],
            Gujarati = [],
            Bengali = [],
            Kannada = [],
            Telugu = [],
            Assamese = [],
            Tamil = [],
            Malayalam = [],
            Hindi = [];

          if (catDetails) {
            const oldQue = catDetails.questions;
            English.push(cat.English.trim());
            Marathi.push(cat.Marathi.trim());
            Gujarati.push(cat.Gujarati.trim());
            Bengali.push(cat.Bengali.trim());
            Kannada.push(cat.Kannada.trim());
            Telugu.push(cat.Telugu.trim());
            // Assamese.push(cat.Assamese.trim())
            Tamil.push(cat.Tamil.trim());
            Malayalam.push(cat.Malayalam.trim());
            Hindi.push(cat.Hindi.trim());
            const question = {
              en: [...oldQue["en"], ...English],
              mr: [...oldQue["mr"], ...Marathi],
              gu: [...oldQue["gu"], ...Gujarati],
              bn: [...oldQue["bn"], ...Bengali],
              kn: [...oldQue["kn"], ...Kannada],
              te: [...oldQue["te"], ...Telugu],
              as: /* [...oldQue['as'], ...Assamese] */[],
              ta: [...oldQue["ta"], ...Tamil],
              ml: [...oldQue["ml"], ...Malayalam],
              hi: [...oldQue["hi"], ...Hindi],
            };
            const data = {
              // ...catDetails,
              questions: question,
            };
            // console.log(catDetails, " records ------------------", data);
            const temp = await updateL5LanguageTemplate(
              { _id: catDetails._id },
              data
            );
            console.log(data,temp, ' gggggggggggggggggggggg')
          }
        }
      }
    } else {
      console.log(" No data")
    }
  } catch (error) {
    respError(res,error.message)
  }
}

module.exports.uploadChatLanguageQuestionsOne = async (req, res) => {
  try {
    const data = req.body;

    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];

        if (cat && cat.Category) {
          const catDetails = await getChatTemplateOne({
            name: { $regex: cat.Category, $options: "i" },
          });

          console.log(catDetails, "catDetails");
          // console.log(catDetails, ' records ------------------')
          let English = [],
            Dutch = [],
            Arabic = [],
            Korean = [],
            Vietnamese = [],
            Turkish = [],
            Javanese = [],
            Persian = [],
            Malay = [],
            Thai = [],
            German = [],
            Polish = [],
            French = [],
            Chinese = [],
            Portuguese = [],
            Spanish = [],
            Italian = [];

          if (catDetails) {
            const oldQue = catDetails.questions;

            English.push(cat.English.trim());
            Dutch.push(cat.Dutch.trim());
            Arabic.push(cat.Arabic.trim());
            Korean.push(cat.Korean.trim());
            Vietnamese.push(cat.Vietnamese.trim());
            Turkish.push(cat.Turkish.trim());
            Javanese.push(cat.Javanese.trim());
            Persian.push(cat.Persian.trim());
            Malay.push(cat.Malay.trim());
            Thai.push(cat.Thai.trim());

            German.push(cat.German.trim());
            Polish.push(cat.Polish.trim());
            French.push(cat.French.trim());
            Chinese.push(cat.Chinese.trim());
            Portuguese.push(cat.Portuguese.trim());
            Spanish.push(cat.Spanish.trim());
            Italian.push(cat.Italian.trim());

            const question = {
              en: [...oldQue["en"], ...English],
              nl: [...oldQue["nl"], ...Dutch],
              ar: [...oldQue["ar"], ...Arabic],
              ko: [...oldQue["ko"], ...Korean],
              vi: [...oldQue["vi"], ...Vietnamese],
              tr: [...oldQue["tr"], ...Turkish],
              jv: [...oldQue["jv"], ...Javanese],
              fa: [...oldQue["fa"], ...Persian],
              ms: [...oldQue["ms"], ...Malay],
              th: [...oldQue["th"], ...Thai],

              de: [...oldQue["de"], ...German],
              pl: [...oldQue["pl"], ...Polish],
              fr: [...oldQue["fr"], ...French],
              "zh-CN": [...oldQue["zh-CN"], ...Chinese],
              pt: [...oldQue["pt"], ...Portuguese],
              es: [...oldQue["es"], ...Spanish],
              it: [...oldQue["it"], ...Italian],
            };

            const data = {
              // ...catDetails,
              questions: question,
            };

            const temp = await updateLanguageTemplateOne(
              { _id: catDetails._id },
              data
            );
            console.log(data, temp, " gggggggggggggggggggggg");
          }
        }
      }
    } else {
      console.log(" NO data");
    }

    respSuccess(res, " Questions data uploaded ");
  } catch (error) {
    console.log(error);
    respError(res, error);
  }
};

module.exports.uploadL4ChatLanguageQuestionsOne = async (req, res) => {
  let data = req.body;

  if (data && data.length) {
    for (let i = 0; i < data.length; i++) {
      const cat = data[i];

      if (cat && cat.Category) {
        const catDetails = await getL4ChatTemplateOne({
          name: { $regex: cat.Category, $options: "i" },
        });

        let English = [],
             Swahili=[],
             Zulu = [];
          // Marathi = [],
          // Gujarati = [],
          // Bengali = [],
          // Kannada = [],
          // Telugu = [],
          // Assamese = [],
          // Tamil = [],
          // Malayalam = [],
          // Hindi = [];

        if (catDetails) {
          const oldQue = catDetails.questions;
          English.push(cat.English.trim());
          Swahili.push(cat.Swahili.trim());
          Zulu.push(cat.Zulu.trim())
          // Marathi.push(cat.Marathi.trim());
          // Gujarati.push(cat.Gujarati.trim());
          // Bengali.push(cat.Bengali.trim());
          // Kannada.push(cat.Kannada.trim());
          // Telugu.push(cat.Telugu.trim());
          // Assamese.push(cat.Assamese.trim())
          // Tamil.push(cat.Tamil.trim());
          // Malayalam.push(cat.Malayalam.trim());
          // Hindi.push(cat.Hindi.trim());
          const question = {
            en: [...oldQue["en"], ...English],
            sw: [...oldQue["sw"],...Swahili],
            zu: [...oldQue["zu"],...Zulu]
            // mr: [...oldQue["mr"], ...Marathi],
            // gu: [...oldQue["gu"], ...Gujarati],
            // bn: [...oldQue["bn"], ...Bengali],
            // kn: [...oldQue["kn"], ...Kannada],
            // te: [...oldQue["te"], ...Telugu],
            // as: /* [...oldQue['as'], ...Assamese] */[],
            // ta: [...oldQue["ta"], ...Tamil],
            // ml: [...oldQue["ml"], ...Malayalam],
            // hi: [...oldQue["hi"], ...Hindi],
          };
          const data = {
            // ...catDetails,
            questions: question,
          };
          console.log(data, " records ------------------", cat.Category);
          const temp = await updateL4LanguageTemplateOne(
            { _id: catDetails._id },
            data
          );
          console.log(data, temp, ' gggggggggggggggggggggg')
        }else{
          console.log("****************Cat Template is not avilable**************",cat)
        }
      }
    }
  } else {
    console.log(" No data")
  }
}

module.exports.uploadL5ChatLanguageQuestionsOne = async (req, res) => {
  try {
    let data = req.body;

    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        const cat = data[i];

        if (cat && cat.Category) {
          const catDetails = await getL5ChatTemplateOne({
            name: { $regex: cat.Category, $options: "i" },
          });

          let English = [],
              Swahili = [],
              Zulu = [];
            // Marathi = [],
            // Gujarati = [],
            // Bengali = [],
            // Kannada = [],
            // Telugu = [],
            // Assamese = [],
            // Tamil = [],
            // Malayalam = [],
            // Hindi = [];

          if (catDetails) {
            const oldQue = catDetails.questions;
            English.push(cat.English.trim());
            Swahili.push(cat.Swahili.trim());
            Zulu.push(cat.Zulu.trim())
            // Marathi.push(cat.Marathi.trim());
            // Gujarati.push(cat.Gujarati.trim());
            // Bengali.push(cat.Bengali.trim());
            // Kannada.push(cat.Kannada.trim());
            // Telugu.push(cat.Telugu.trim());
            // // Assamese.push(cat.Assamese.trim())
            // Tamil.push(cat.Tamil.trim());
            // Malayalam.push(cat.Malayalam.trim());
            // Hindi.push(cat.Hindi.trim());
            const question = {
              en: [...oldQue["en"], ...English],
              sw: [...oldQue["sw"], ...Swahili],
              zu: [...oldQue["zu"], ...Zulu]
              // mr: [...oldQue["mr"], ...Marathi],
              // gu: [...oldQue["gu"], ...Gujarati],
              // bn: [...oldQue["bn"], ...Bengali],
              // kn: [...oldQue["kn"], ...Kannada],
              // te: [...oldQue["te"], ...Telugu],
              // as: /* [...oldQue['as'], ...Assamese] */[],
              // ta: [...oldQue["ta"], ...Tamil],
              // ml: [...oldQue["ml"], ...Malayalam],
              // hi: [...oldQue["hi"], ...Hindi],
            };
            const data = {
              // ...catDetails,
              questions: question,
            };
            // console.log(catDetails, " records ------------------", data);
            const temp = await updateL5LanguageTemplateOne(
              { _id: catDetails._id },
              data
            );
            console.log(data, temp, ' gggggggggggggggggggggg')
          }
        }
      }
    } else {
      console.log(" No data")
    }
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.getAllChatTemplates = async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const query = {};
    // const result = await getChatAllTemplates(query, { skip: parseInt(skip), limit: parseInt(limit) })
    let reqOrigin = req.get("origin");

    const resultL3 = oneBazaarRequestOrigin.includes(reqOrigin)
      ? await getChatAllTemplatesOne(query, {
        skip: parseInt(skip),
        limit: parseInt(limit),
      })
      : await getChatAllTemplates(query, {
        skip: parseInt(skip),
        limit: parseInt(limit),
      });

    const resultL4 = oneBazaarRequestOrigin.includes(reqOrigin)
      ? await getL4ChatAllTemplatesOne(query)
      : await getL4ChatAllTemplates(query)

    const resultL5 = oneBazaarRequestOrigin.includes(reqOrigin)
      ? await getL5ChatAllTemplatesOne(query)
      : await getL5ChatAllTemplates(query)

    let finalResult = [...resultL3, ...resultL4, ...resultL5];

    respSuccess(res, finalResult);
  } catch (error) {
    console.log(error);
    respError(res, error);
  }
};

module.exports.getChatTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const query = {
      l3: id,
    };
    const result = await getChatTemplate(query);
    const data = await getChatAllTemplates(query, { skip: 0, limit: 5 });
    const final = [result, ...data];
    respSuccess(res, final);
  } catch (error) {
    console.log(error);
    respError(res, error);
  }
};
