const { respSuccess, respError } = require("../../utils/respHadler");
const { News } = require("../../modules");
const { createNews, getAllNews } = News;

module.exports.createNews = async (req, res) => {
  try {
    const newsCreated = await createNews(req.body);
    respSuccess(res, newsCreated, "Record successfully added");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllNews = async (req, res) => {
  try {
    const allNews = await getAllNews();
    respSuccess(res, allNews);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateNews = async (req, res) => {
    try{
        console.log(req.params.id);

    }catch(error){
        respError(res, error.message);
    }
}

