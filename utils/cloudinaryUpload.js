const { cloudinary } = require("../cloudConfig.js");

/**
 * Uploads an in-memory file buffer (from multer.memoryStorage()) straight to
 * Cloudinary via a stream — no adapter package, no temp files on disk.
 *
 * We deliberately dropped `multer-storage-cloudinary` here: its latest release
 * (4.0.0) still peer-depends on cloudinary@^1.x, which conflicts with the
 * cloudinary@^2.x SDK this project needs and breaks `npm install` outright
 * with an ERESOLVE error. The package hasn't been updated for the v2 SDK, so
 * pinning around it is a dead end — this direct approach has one less
 * dependency and won't rot the same way.
 */
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
