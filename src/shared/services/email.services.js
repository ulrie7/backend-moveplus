/**
 * @EmailServices
 */
const path = require('path');
const nodemailer = require('nodemailer');
const Email = require('email-templates');
module.exports = class EmailServices {

  constructor() {

  }
  static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_USE_SSL == "true" ? true : false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })
  /**
   * @sendEmail
   */
  static async sendEmail(email, locals, template, attachments = []) {
    try {
      // Validate inputs
      if (!email || !template) {
        throw new Error("Both 'email' and 'template' parameters are required.");
      }

      const emailObj = new Email({
        message: {
          from: {
            name: process.env.SMTP_FROM_NAME || process.env.APP_NAME,
            address: process.env.SMTP_FROM_ADDRESS,
          },
        },
        send: true,
        // send: process.env.NODE_ENV !== 'development', // Only send emails outside of development mode
        transport: this.transporter, // Use the static transporter
        views: {
          root: path.resolve(path.dirname(__dirname), 'snippets/email_markup/templates/'),
          options: {
            extension: 'njk',
          },
        },
        preview: false, // Disable preview in development if not needed
      });

      // Send the email
      const mail = await emailObj.send({
        template,
        message: {
          to: email,
          attachments
        },
        locals: {
          ...locals
        },
      });

      return {
        success: true,
        data: mail,
      };

    } catch (error) {
      // Log error details
      if (process.env.NODE_ENV === 'development') {
        console.error("Email failed to send:", {
          email,
          locals,
          error: error.message,
        });
      }

      // Suppress errors based on environment variable
      if (process.env.EMAIL_SUPPRESS_ERRORS === 'true') {
        return {
          success: false,
          error: error.message,
        };
      }

      // Re-throw the error if suppression is disabled
      throw error;
    }
  }

}