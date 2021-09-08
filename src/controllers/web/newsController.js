const { respSuccess, respError } = require("../../utils/respHadler");
const { News } = require("../../modules");
const { getAllNews } = News;
const moment = require("moment");

/**get all News*/
module.exports.getAllNews = async (req, res) => {
  try {
    const { search, skip, limit } = req.query;
    let todayDate = moment().format('YYYY-MM-DD');
    const query  = { search : {'$where': 'this.updatedAt.toJSON().slice(0, 10) == "' + todayDate + '"' }}
    const allNews = await getAllNews(query);
    respSuccess(res, allNews);
  } catch (error) {
    respError(res, error.message);
  }
};
