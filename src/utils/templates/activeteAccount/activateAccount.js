const {
    imageURLS
} = require('../../globalConstants')
const {
    logo,
    logoOne,
    registerationFlow,
    facebook,
    twitter,
    linkedIn
} = imageURLS;

exports.activateAccount = (link) => new Promise((resolve, reject) => {
    if (link) {
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
               <!-- (Optional) This text will appear in the inbox preview, but not the email body. -->
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
                        <td style="padding: 42px 0; text-align: center">
                            <img src=${link.includes('onebazaar') ? logoOne : logo} aria-hidden="true" width="108"
                                 height="63" alt="logo"
                                 border="0"
                                 style = "height: 45px; width: 199px; transform:scale(2); font-family: sans-serif; font-size: 15px; line-height: 20px; color: #555555;">
                        </td>
                    </tr>
                </table>
                <!-- Email Header : END -->
        
                <!-- Email Body : BEGIN -->
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center"
                       width="100%" style="max-width: 680px;" class="email-container">
        
                    
            <!-- Email Body : BEGIN -->
            <tr>
                <td bgcolor="#ffffff">
                    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                           width="100%">
                        <tbody>
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:20px; font-weight:600; letter-spacing:0.07em; line-height:2em;">
                            ${link.includes('onebazaar')? 'Onebazaar': 'Ekbazaar'} Trade- Email verification
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0px 16.66% 10px 16.66%; text-align: center; display: block;">
                                <img style="width: 100%"
                                     src=${registerationFlow}
                                     alt="Activate Your Account">
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff">
                                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                                       width="100%">
                                    <tbody>
                                    <tr>
                                        <td style="padding:40px; text-align: center; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:13.5px; font-weight:300; letter-spacing:0.07em; line-height:2em;">
                                            Please verify your email address by clicking on the button below and get notified on your account and interests.
                                            <br><br>
                                            <!-- Button : BEGIN -->
                                            <table role="presentation" aria-hidden="true" cellspacing="0"
                                                   cellpadding="0" border="0"
                                                   align="center" style="margin: auto">
                                                <tbody>
                                                <tr>
                                                    <td style="border-radius: 3px; background: #222222; text-align: center;"
                                                        class="button-td">
                                                        <a href=${link}
                                                           style="background: #3225A7; border: 15px solid #3225A7; font-family: sans-serif; font-size: 13px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;"
                                                           class="button-a">
                                                            <span style="color:#ffffff;" class="button-link">&nbsp;&nbsp;&nbsp;&nbsp;VERIFY EMAIL&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                                        </a>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <!-- Button : END -->
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tbody>
                    </table>
                </td>
            </tr>
        
            <!-- Email Body : END -->
        
        
                </table>
                <!-- Email Body : END -->
        
                <!-- Email Footer : BEGIN -->
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center"
                       width="100%" style="max-width: 680px;">
                    <tr>
                        <td style="padding:40px 10px 20px 10px; width: 100%;font-size: 12px; font-family: sans-serif; line-height:18px; text-align: center; color: #888888;"
                            class="x-gmail-data-detectors">
                             Copyright 2021© ${link.includes('onebazaar')? 'Onebazaar.com': 'Ekbazaar.com'}, All rights reserved.
                        </td>
                    </tr>
                </table>
                <!-- Email Footer : END -->
        
                <!--[if mso]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </div>
        </center>
        </body>
        </html>`
        resolve(html)
    } else {
        reject('link is not present')
    }
})