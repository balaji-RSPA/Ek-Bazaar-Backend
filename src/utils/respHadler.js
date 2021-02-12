module.exports.respSuccess = (res, obj, message) => {

  let respData;

  if (typeof obj === 'object') {

    respData = {
      data: obj
    };

  } else {

    respData = {
      message: obj
    };

  }

  if (message) respData = { ...respData, message }

  const respObj = {
    success: true,
    ...respData
  };
  res.status(200).json(respObj);
  res.end();

}

module.exports.respUnAuthorized = (res, msg) => {

  const respData = {
    success: false,
    auth: false,
    message: msg || 'Un-Authourized Access!'
  };
  res.status(401).json(respData);
  res.end();

}

module.exports.respAuthFailed = (res, data, msg) => {

  const respData = {
    success: false,
    auth: false,
    data: data,
    message: msg
  };
  res.status(200).json(respData);
  res.end();

}

module.exports.respError = (res, obj, message) => {

  let respData;

  if (typeof obj === 'object') {

    respData = {
      data: obj
    };

  } else {

    respData = {
      message: obj
    };

  }

  if (message) respData = { ...respData, message }

  const respObj = {
    success: false,
    ...respData
  };
  res.status(200).json(respObj);
  res.end();

}
