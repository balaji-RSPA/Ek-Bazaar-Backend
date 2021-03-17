const {
  button
} = require('./emailButton')

module.exports.emailBody = (params) => 
{
    let grt = '';
    let ext = '';
    let exc1 = '';
    let exc2 = '';
    if(params.greeting){
       grt = `<td bgcolor="#ffffff">
                  <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                        width="100%">
                      <tbody>
                      <tr>
                         <td style = "padding: 40px 40px 20px 40px; text-align: left; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:20px; font-weight:600; letter-spacing:0.07em; line-height:2em;" >
                              ${params.greeting}
                          </td>
                      </tr>
                      </tbody>
                  </table>
              </td>
              <!-- $ {ext}
              $ {exc1}
              $ {exc2}-->
          </tbody>
      </table>
    </td>`
    }
    if (params.extraTitle) {
        ext = `<tr>
            <td bgcolor="#ffffff" style="padding: 0px 40px 20px 40px; text-align: left; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:20px; font-weight:600; letter-spacing:0.07em; line-height:2em;">
            ${params.extraTitle}
                </td>
        </tr>`
    }
    if (params.extracontent1) {
        exc1 = `<tr>
                <td bgcolor="#ffffff" style="padding:0px 15px 15px 40px; text-align: left; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:13.5px; font-weight:300; letter-spacing:0.07em; line-height:2em;">
                    ${params.extracontent1}
                </td>
            </tr>`
    }
    if (params.extracontent2) {
        exc2 = `<tr>
            <td bgcolor="#ffffff" style="text-align: left; padding:0px 0px 46px 40px; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:13.5px; font-weight:300; letter-spacing:0.07em; line-height:2em;">
                ${params.extracontent2}
            </td>
        </tr>`
    }
    let emailbody = `<!-- Email Body : BEGIN -->
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
                                   ${params.title}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0px 16.66% 10px 16.66%; text-align: center; display: block;">
                                    <img src=${params.image}
                                        alt= ${params.title}>
                                </td>
                            </tr>
                            <tr>
                              ${grt}
                             </tr>
                            <td bgcolor="#ffffff">
                                    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                                          width="100%">
                                        <tbody>
                                        <tr>
                                            <td style = "padding-left:40px; padding-right:40px; padding-bottom: 40px;text-align: center; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:13.5px; font-weight:300; letter-spacing:0.07em; line-height:2em;">
                                                ${params.body}
                                                <br><br>
                                                ${button(params.buttonName,params.buttonLink)}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                                ${ext}
                                ${exc1}
                                ${exc2}
                            </tbody>
                        </table>
                    </td>
                </tr>
                <!-- Email Body : END -->
                </table>
              <!-- Email Body : END -->`
              return emailbody;
}

// padding: 40 px;