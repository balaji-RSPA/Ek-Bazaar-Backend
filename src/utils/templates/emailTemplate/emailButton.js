

module.exports.button = (buttonName,link) => {
  let buttonVal
  if(link){
    buttonVal = ` <!-- Button : BEGIN -->
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
                                            <span style="color:#ffffff;" class="button-link">&nbsp;&nbsp;&nbsp;&nbsp;${buttonName.toUpperCase()}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            </a>
                                    </td>
                                    </tr>
                                </tbody>
                        </table>
                     <!-- Button : END -->`
  }else{
   buttonVal = ""
  }
  return buttonVal;
}