const fs = require("fs");
var AWS = require("aws-sdk");

/* The following four lines are for AWS access */
const bucketName = process.env.AWS_BUCKET;
const region = process.env.AWS_DEFAULT_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Create AWS access object
const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// This function is called to upload a file to AWS
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

module.exports = { uploadFile };
