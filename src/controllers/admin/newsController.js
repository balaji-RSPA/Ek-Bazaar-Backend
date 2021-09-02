const { respSuccess, respError } = require("../../utils/respHadler");
const { News } = require("../../modules");
const { createNews, getAllNews } = News;

module.exports.getAllNews = async(req, res) => {
    try{
        const allNews = await getAllNews();
    console.log(allNews);

        respSuccess(res, allNews);
    }catch(error){
        respError(res, error.message);
    }
    // console.log(req.body)

}

module.exports.createNews = async(req, res) => {
    try{
        const newsCreated = await createNews(req.body);
        respSuccess(res, newsCreated, "Record successfully added");
    }catch(error){
        respError(res, error.message);
    }
}