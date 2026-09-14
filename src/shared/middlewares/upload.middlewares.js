/**
 * @UploadMiddleware 
 */
module.exports = class UploadMiddlewareMiddlewares {

  constructor() {
    const UploadService = require("../services/upload.services")
    this.service = new UploadService()

    this.multer = require("multer");
  }
  /**
   * @defaultUpload
   */
  defaultUpload(path, separator, limit = 1024 * 1024 * 20, filter = "*") {
    let fileFilter
    switch (filter) {
      case '*':
        fileFilter = this.service.fileFilter
        break;
      case 'image':
        fileFilter = this.service.imageFilter
        break;
      case 'message':
        fileFilter = this.service.messageFileFilter
        break;
      case 'document':
        fileFilter = this.service.documentFilter
        break;
      default:
        fileFilter = this.service.imageFilter
        break;
    }

    return this.multer({
      storage: this.service.storage(path, separator),
      limits: {
        fileSize: limit,
      },
      fileFilter: fileFilter,
    });
  }

}