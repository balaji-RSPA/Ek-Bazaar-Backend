const {
    imageURLS
} = require('../../globalConstants')

module.exports.emailLogo = (params) => {
    const {logoEkb,logoOne,facebook,twitter,linkedIn} = imageURLS; 

    let logo;
    if(!params.originOneFlag){
        logo = `<img src=${logoEkb} aria-hidden="true" width="108"
        height="63" alt="logo"
        border="0"
        style="height: 45px; width: 199px; transform:scale(2); font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">`
    }else {
        logo = `<img src=${logoOne} aria-hidden="true" width="108"
        height="63" alt="logo"
        border="0"
        style="height: 45px; width: 199px; transform:scale(2); font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">`
    }

    return logo;
}