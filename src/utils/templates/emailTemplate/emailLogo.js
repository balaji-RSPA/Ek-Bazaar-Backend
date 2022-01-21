const {
    imageURLS
} = require('../../globalConstants')

module.exports.emailLogo = (params) => {
    const {logo,logoOne,facebook,twitter,linkedIn} = imageURLS; 

    let logoContaint;
    if(!params.originOneFlag){
        logoContaint = `<img src=${logo} aria-hidden="true" width="108"
        height="63" alt="logo"
        border="0"
        style="height: 45px; width: 199px; transform:scale(2); font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">`
    }else {
        logoContaint = `<img src=${logoOne} aria-hidden="true" width="108"
        height="63" alt="logo"
        border="0"
        style="height: 45px; width: 199px; transform:scale(2); font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">`
    }

    return logoContaint;
}