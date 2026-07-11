const { cloudinary } = require("../cloudConfig.js");

function uploadBuffer(buffer, folder = "havennest") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, allowed_formats: ["png", "jpg", "jpeg"] },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer };
