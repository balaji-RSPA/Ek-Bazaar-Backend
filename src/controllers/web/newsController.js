const { respSuccess, respError } = require("../../utils/respHadler");
const { News } = require("../../modules");
const { getAllNews } = News;

/**get all News*/
module.exports.getAllNews = async (req, res) => {
  try {
    const { search, skip, limit } = req.query;
    const allNews = await getAllNews(search, parseInt(skip), parseInt(limit));
    respSuccess(res, allNews);
  } catch (error) {
    respError(res, error.message);
  }
};
