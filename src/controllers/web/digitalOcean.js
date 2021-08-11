const { respSuccess, respError } = require("../../utils/respHadler");
const { listAllDigitalOceanDocs,deleteDigitalOceanDocs } = require("../../utils/utils")
const {updateSellerProduct} = require("../../controllers/web/sellersController")



module.exports.listAllDigitalOceanImages = async(req,res) => {
  try{
    let result = await listAllDigitalOceanDocs();
    respSuccess(res, result ,"Successfully fetched")
  }catch(error){
   respError(res, error.message)
  }
}

module.exports.deleteDigitalOceanDocs = async (req, res) => {
  try {
    let fileName = req.body && req.body.productDetails && req.body.productDetails.document && req.body.productDetails.document.name;
    let sellerId = req.body && req.body.sellerId && req.body.sellerId._id;
    const key = `${sellerId}/${fileName}`
    await deleteDigitalOceanDocs({key});
    if(fileName){
      await updateSellerProduct({prodDtl: req.body},res)
    }
    respSuccess(res,"Deleted Successfully")
  } catch (error) {
    respError(res, error.message)
  }
}