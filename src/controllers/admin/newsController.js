const { respSuccess, respError } = require("../../utils/respHadler");
const { News } = require("../../modules");
const { createNews, getAllNews, getNews, updateNews, deleteNews } = News;

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
    const {search,skip,limit} = req.body
    const allNews = await getAllNews(search,skip,limit);
    respSuccess(res, allNews);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getNews = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await getNews({ _id: id });
    if (!news) {
      respSuccess(res, news, "No Record Found");
      return false;
    }

    respSuccess(res, news);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateNews = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedNewsData = {};
    const { news } = req.body;
    if (news) {
      updatedNewsData.news = news;
    }
    const updatedNews = await updateNews({ _id: id }, updatedNewsData);
    respSuccess(res, updatedNews, "Record successfully updated");
  } catch (error) {
    respError(res, error.message);
  }
};


module.exports.deleteNews = async (req, res) => {
  try{
    const id = req.params.id;
    const deleteStatus = await deleteNews({_id: id});
    console.log("controlller");
    console.log(deleteStatus);

    respSuccess(res, deleteStatus, "Record deleted successfully");
  }catch(error){
    respError(res, error.message);
  }
}