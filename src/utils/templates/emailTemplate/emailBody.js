const {
  button
} = require('./emailButton')

module.exports.emailBody = (params) => `<!-- Email Body : BEGIN -->
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
                                    <img style="width: 100%"
                                        src=${params.image}
                                        alt= ${params.title}>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff">
                                    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                                          width="100%">
                                        <tbody>
                                        <tr>
                                            <td style="padding:40px; text-align: center; font-family:'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif; color:#2e343b; font-size:13.5px; font-weight:300; letter-spacing:0.07em; line-height:2em;">
                                                ${params.body}
                                                <br><br>
                                                ${button(params.title,params.link)}
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
              <!-- Email Body : END -->`