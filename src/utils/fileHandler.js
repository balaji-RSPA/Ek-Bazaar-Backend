const aws = require('aws-sdk');

const {
  awsKeys
} = require('./globalConstants')

const {
  secretAccessKey,
  region,
  accessKeyId,
  Bucket
} = awsKeys;

aws.config.update({
  secretAccessKey,
  accessKeyId,
  region
});

const s3 = new aws.S3();

exports.getFilesFroms3 = (tradeKey) => new Promise((resolve, reject) => {

  const Prefix = `${tradeKey}/`
  const params = {
    Bucket,
    Delimiter: '/',
    Prefix
  }
  s3.listObjects(params, (err, data) => {

    if (err) {

      return reject(err)

    }
    return resolve(data)

  })

})

exports.fileUploadToS3 = (file, key) => new Promise((resolve, reject) => {

  const fileName = file.name
  const params = {
    Bucket,
    Key: `${key}/${fileName}`,
    Body: file.data
  };
  return s3.putObject(params, (err) => {

    if (err) {

      return reject(err);

    }
    return resolve(fileName);

  });

})

exports.deleteFileFromS3 = (filePath) => new Promise((resolve, reject) => {

  const params = {
    Bucket,
    Key: filePath
  };
  s3.deleteObject(params, (err, data) => {

    if (err) {

      // console.log('File deleted successfully');
      return reject(err)

    }

    return resolve('Deleted!')

  });

})
