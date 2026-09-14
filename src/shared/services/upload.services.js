/**
 * @UploadService 
 */

const FS = require('../lib/fs')
const multer = require('multer')
module.exports = class UploadServiceServices {

  constructor() {

  }
  /**
   * @imageFilter 
   */
  imageFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only jpeg,jpg and png is authorize"), false);
    }
  };
  /**
   * @fileFilter 
   */
  fileFilter = (req, file, cb) => {
    if (file) {
      cb(null, true);
    } else {
      cb(new Error("Something went error"), false);
    }
  };
  /**
   * @documentFilter 
   */
  documentFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only jpeg,jpg , png and pdf is authorize"), false);
    }
  };
  /**
   * Message file filter
   * @Image : jpeg , jpg , png
   * @Video :
   * @Audio :
   */
  messageFileFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only jpeg,jpg and png is authorize"), false);
    }
  };
  /**
   * Storage
   */
  storage = (folder, separator = null) => {
    return multer.diskStorage({
      destination: async function(req, file, cb) {
        if (!FS.existsSync(folder)) {
          await FS.createDirectory(folder);
        }
        cb(null, folder);
      },
      filename: function(req, file, cb) {
        let name = new Date().toISOString().replace(/:/g, "-") +
          Math.round(Math.random() * 693) +
          file.originalname

        if (separator) {
          name = new Date().toISOString().replace(/:/g, "-") +
            Math.round(Math.random() * 693) + separator +
            file.originalname
        }

        cb(
          null,
          name
        );
      },
    });
  };

}