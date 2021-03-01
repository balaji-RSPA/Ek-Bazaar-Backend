const {
  emailFooter
} = require('./commonTemplateFooter');
const {
  emailBody
} = require('./emailBody');
const {
    imageURLS
} = require('../../globalConstants')
const {logo,facebook,twitter,linkedIn} = imageURLS;
exports.commonTemplate = (params) => {
  const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
            <!-- Web Font / @font-face : BEGIN -->
        
            <!--[if mso]>
            <style>
                * {
                    font-family: sans-serif !important;
                }
            </style>
            <![endif]-->
        
            <!--[if !mso]><!-->
            <link href='https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700' rel='stylesheet' type='text/css'>
            <!--<![endif]-->
        
            <!-- Web Font / @font-face : END -->
        
            <!-- CSS Reset -->
            <style>
        
        
                html,
                body {
                    margin: 0 auto !important;
                    padding: 0 !important;
                    height: 100% !important;
                    width: 100% !important;
                }
        
                * {
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                }
        
                div[style*="margin: 16px 0"] {
                    margin: 0 !important;
                }
        
                table,
                td {
                    mso-table-lspace: 0pt !important;
                    mso-table-rspace: 0pt !important;
                }
        
                table {
                    border-spacing: 0 !important;
                    border-collapse: collapse !important;
                    table-layout: fixed !important;
                    margin: 0 auto !important;
                }
        
                table table table {
                    table-layout: auto;
                }
        
                img {
                    -ms-interpolation-mode: bicubic;
                }
        
                *[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                }
        
                .x-gmail-data-detectors,
                .x-gmail-data-detectors *,
                .aBn {
                    border-bottom: 0 !important;
                    cursor: default !important;
                }
        
                .a6S {
                    display: none !important;
                    opacity: 0.01 !important;
                }
        
        
                img.g-img + div {
                    display: none !important;
                }
        
                .button-link {
                    text-decoration: none !important;
                }
        
                @media  only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                    /* iPhone 6 and 6+ */
                    .email-container {
                        min-width: 375px !important;
                    }
                }
        
            </style>
        
            <!--[if gte mso 9]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
        
            <!-- Progressive Enhancements -->
            <style>
        
                body, h1, h2, h3, h4, h5, h6, p, a {
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;;
                }
        
                .button-td,
                .button-a {
                    transition: all 100ms ease-in;
                }
        
                .button-td:hover,
                .button-a:hover {
                    background: #45C8FF !important;
                    border-color: #45C8FF !important;
                }
        
                @media  screen and (max-width: 480px) {
        
                    .fluid {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
        
                    .stack-column,
                    .stack-column-center {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        direction: ltr !important;
                    }
        
                    .stack-column-center {
                        text-align: center !important;
                    }
        
                    .center-on-narrow {
                        text-align: center !important;
                        display: block !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                        float: none !important;
                    }
        
                    table.center-on-narrow {
                        display: inline-block !important;
                    }
                }
        
            </style>
        
        </head>
        <body width="100%" bgcolor="#F7F9FC" style="margin: 0; mso-line-height-rule: exactly;">
        <center style="width: 100%; background: #F7F9FC; text-align: left;">
        
            <!-- Visually Hidden Preheader Text : BEGIN -->
            <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family: sans-serif;">
                (Optional) This text will appear in the inbox preview, but not the email body.
            </div>
            <!-- Visually Hidden Preheader Text : END -->
        
            <div style="max-width: 680px; margin: auto;" class="email-container">
                <!--[if mso]>
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="680"
                       align="center">
                    <tr>
                        <td>
                <![endif]-->
        
                <!-- Email Header : BEGIN -->
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center"
                       width="100%" style="max-width: 680px;">
                    <tr>
                        <td style="padding: 25px 0; text-align: center">
                            <img src=${logo} aria-hidden="true" width="108"
                                 height="63" alt="logo"
                                 border="0"
                                 style="height: 45px; width: 199px; transform:scale(2); font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                        </td>
                    </tr>
                </table>
                <!-- Email Header : END -->
               ${emailBody(params)}
               <!-- Email Footer : BEGIN -->
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center"
                       width="100%" style="max-width: 680px;">
                    <tr>
                        <td style="padding:40px 10px 20px 10px; width: 100%;font-size: 12px; font-family: sans-serif; line-height:18px; text-align: center; color: #888888;"
                            class="x-gmail-data-detectors">
                             Copyright 2021© EkBazaar.com, All rights reserved.
                        </td>
                    </tr>
                </table>
                <!-- Email Footer : END -->
                </td>
                </tr>
                </table>
                <![endif]-->
            </div>
        </center>
        </body>
        </html>`
  return html;
}
// new Promise((resolve, reject) => {
//   if (link) {

//     resolve(html)
//   } else {
//     reject('link is not present')
//   }
// })