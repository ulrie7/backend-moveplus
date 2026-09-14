/**
 * @SmsServices - Professional SMS service for sending text messages
 * Supports multiple SMS providers (Twilio, AWS SNS, Africa's Talking, etc.)
 */

const nunjucks = require('nunjucks');
const path = require('path');
module.exports = class SmsServices {

  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio'; // twilio, sns, africastalking, nexmo
    this.initializeProvider();
    this.initializeTemplateEngine();
  }
  /**
   * @initializeTemplateEngine - Initialize Nunjucks template engine
   */
  initializeTemplateEngine() {
    const templatePath = path.join(path.dirname(__dirname), 'snippets/sms_markup/templates');

    this.templateEnv = nunjucks.configure(templatePath, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
      noCache: process.env.NODE_ENV === 'development'
    });

    // Add custom filters
    this.templateEnv.addFilter('phone', (str) => {
      return str.replace(/[^\d+]/g, '');
    });

    this.templateEnv.addFilter('uppercase', (str) => {
      return str.toUpperCase();
    });

    this.templateEnv.addFilter('truncate', (str, length = 160) => {
      return str.length > length ? str.substring(0, length - 3) + '...' : str;
    });
  }
  /**
   * @initializeProvider - Initialize SMS provider based on configuration
   */
  initializeProvider() {
    try {
      switch (this.provider.toLowerCase()) {
        case 'twilio':
          this.client = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
          break;

        case 'sns':
          const AWS = require('aws-sdk');
          this.client = new AWS.SNS({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
          });
          break;

        case 'africastalking':
          const AfricasTalking = require('africastalking')({
            apiKey: process.env.AFRICASTALKING_API_KEY,
            username: process.env.AFRICASTALKING_USERNAME
          });
          this.client = AfricasTalking.SMS;
          this.fromNumber = process.env.AFRICASTALKING_SHORTCODE;
          break;

        case 'nexmo':
          const Nexmo = require('nexmo');
          this.client = new Nexmo({
            apiKey: process.env.NEXMO_API_KEY,
            apiSecret: process.env.NEXMO_API_SECRET
          });
          this.fromNumber = process.env.NEXMO_PHONE_NUMBER;
          break;

        default:
          console.warn(`SMS Provider ${this.provider} not configured. SMS sending will be simulated.`);
          this.client = null;
      }
    } catch (error) {
      console.error('Failed to initialize SMS provider:', error.message);
      this.client = null;
    }
  }
  /**
   * @sendSMS - Send SMS using configured provider
   * @param {string} phoneNumber - Recipient phone number (E.164 format: +1234567890)
   * @param {object} locals - Template variables
   * @param {string} template - Template name (without .njk extension)
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  static async sendSMS(phoneNumber, locals, template) {
    try {
      const instance = new SmsServices();
      return await instance.send(phoneNumber, locals, template);
    } catch (error) {
      if (process.env.SMS_SUPPRESS_ERRORS === 'true') {
        return {
          success: false,
          error: error.message
        };
      }
      throw error;
    }
  }
  /**
   * @send - Internal send method
   */
  async send(phoneNumber, locals, template) {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error(`Invalid phone number format: ${phoneNumber}`);
      }

      // Format phone number to E.164
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Get message content from template
      const message = await this.renderTemplate(template, locals);

      // Send based on provider
      let result;
      switch (this.provider.toLowerCase()) {
        case 'twilio':
          result = await this.sendViaTwilio(formattedPhone, message);
          break;
        case 'sns':
          result = await this.sendViaSNS(formattedPhone, message);
          break;
        case 'africastalking':
          result = await this.sendViaAfricasTalking(formattedPhone, message);
          break;
        case 'nexmo':
          result = await this.sendViaNexmo(formattedPhone, message);
          break;
        default:
          result = await this.simulateSend(formattedPhone, message);
      }

      return {
        success: true,
        messageId: result.messageId,
        provider: this.provider,
        to: formattedPhone,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('SMS failed to send:', {
          phoneNumber,
          template,
          locals,
          error: error.message
        });
      }

      if (process.env.SMS_SUPPRESS_ERRORS === 'true') {
        return {
          success: false,
          error: error.message,
          provider: this.provider,
          timestamp: new Date().toISOString()
        };
      }

      throw error;
    }
  }
  /**
   * @renderTemplate - Render Nunjucks template with locals
   */
  async renderTemplate(template, locals) {
    try {
      // Add default context variables
      const context = {
        ...locals,
        appName: process.env.APP_NAME || 'Application',
        year: new Date().getFullYear(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };

      // Render the template
      const templateFile = template.endsWith('.njk') ? template : `${template}.njk`;
      const renderedText = this.templateEnv.render(templateFile, context);

      // SMS has character limit, trim to 160 characters for standard SMS
      const maxLength = process.env.SMS_MAX_LENGTH || 160;
      const trimmedText = renderedText.trim();

      if (trimmedText.length > maxLength) {
        console.warn(`SMS message exceeds ${maxLength} characters. Message will be split or truncated by provider.`);
      }

      return trimmedText;

    } catch (error) {
      // If template file not found, treat template as direct text
      if (error.message.includes('template not found')) {
        console.warn(`Template ${template} not found, using as direct text`);

        // Return the template string as-is or use fallback templates
        return this.getFallbackTemplate(template, locals);
      }
      throw error;
    }
  }
  /**
   * @getFallbackTemplate - Get fallback template when .njk file not found
   */
  getFallbackTemplate(templateName, locals) {
    const templates = {
      MFA_SMS: `${locals.code} is your verification code for ${process.env.APP_NAME || 'our service'}. Valid for 15 minutes.`,

      OTP_LOGIN: `${locals.code} is your one-time password for ${process.env.APP_NAME || 'our service'}. Valid for 15 minutes.`,

      PASSWORD_RESET: `${locals.code} is your password reset code for ${process.env.APP_NAME || 'our service'}. Valid for 15 minutes.`,

      VERIFICATION_CODE: `${locals.code} is your verification code for ${process.env.APP_NAME || 'our service'}. Do not share this code.`,

      WELCOME: `Welcome to ${process.env.APP_NAME || 'our service'}! Your account has been created successfully.`,

      PHONE_VERIFICATION: `Please verify your phone number using code: ${locals.code}. Valid for 15 minutes.`,

      ACCOUNT_ALERT: `Security alert: ${locals.message}. If this wasn't you, please contact support immediately.`,

      CUSTOM: locals.message || templateName
    };

    return templates[templateName] || templates.CUSTOM;
  }
  /**
   * @sendViaTwilio - Send SMS via Twilio
   */
  async sendViaTwilio(phoneNumber, message) {
    const result = await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: phoneNumber
    });

    return {
      messageId: result.sid
    };
  }
  /**
   * @sendViaSNS - Send SMS via AWS SNS
   */
  async sendViaSNS(phoneNumber, message) {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    };

    const result = await this.client.publish(params).promise();
    return {
      messageId: result.MessageId
    };
  }
  /**
   * @sendViaAfricasTalking - Send SMS via Africa's Talking
   */
  async sendViaAfricasTalking(phoneNumber, message) {
    const options = {
      to: [phoneNumber],
      message: message,
      from: this.fromNumber
    };

    const result = await this.client.send(options);
    return {
      messageId: result.SMSMessageData.Recipients[0].messageId
    };
  }
  /**
   * @sendViaNexmo - Send SMS via Nexmo (Vonage)
   */
  async sendViaNexmo(phoneNumber, message) {
    return new Promise((resolve, reject) => {
      this.client.message.sendSms(
        this.fromNumber,
        phoneNumber,
        message,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              messageId: result.messages[0]['message-id']
            });
          }
        }
      );
    });
  }
  /**
   * @simulateSend - Simulate SMS sending in development
   */
  async simulateSend(phoneNumber, message) {
    console.log('\n=== SIMULATED SMS ===');
    console.log(`Provider: ${this.provider}`);
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log(`Length: ${message.length} characters`);
    console.log('====================\n');

    return {
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'simulated'
    };
  }
  /**
   * @isValidPhoneNumber - Basic phone number validation
   */
  isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;

    // Remove spaces, dashes, parentheses
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Check if it starts with + and has 10-15 digits
    const e164Regex = /^\+[1-9]\d{9,14}$/;

    return e164Regex.test(cleaned);
  }
  /**
   * @formatPhoneNumber - Format phone number to E.164
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If doesn't start with +, add country code
    if (!cleaned.startsWith('+')) {
      const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '+229'; // Benin
      cleaned = defaultCountryCode + cleaned;
    }

    return cleaned;
  }
  /**
   * @sendBulkSMS - Send SMS to multiple recipients
   */
  static async sendBulkSMS(phoneNumbers, locals, template) {
    const instance = new SmsServices();
    const results = [];
    const delayMs = process.env.SMS_BULK_DELAY || 500;

    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await instance.send(phoneNumber, locals, template);
        results.push({
          phoneNumber,
          ...result
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      results,
      total: phoneNumbers.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      provider: instance.provider
    };
  }
  /**
   * @verifyPhoneNumber - Verify if phone number can receive SMS
   */
  static async verifyPhoneNumber(phoneNumber) {
    const instance = new SmsServices();

    try {
      const formatted = instance.formatPhoneNumber(phoneNumber);
      const isValid = instance.isValidPhoneNumber(formatted);

      return {
        valid: isValid,
        formatted: formatted,
        provider: instance.provider
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  /**
   * @getProviderInfo - Get information about current provider
   */
  static getProviderInfo() {
    const instance = new SmsServices();

    const providerDetails = {
      twilio: {
        name: 'Twilio',
        features: ['SMS', 'MMS', 'Global coverage'],
        pricing: 'Pay per message',
        documentation: 'https://www.twilio.com/docs/sms'
      },
      sns: {
        name: 'AWS SNS',
        features: ['SMS', 'Global coverage', 'High volume'],
        pricing: 'Pay per message',
        documentation: 'https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-phone-number-as-subscriber.html'
      },
      africastalking: {
        name: "Africa's Talking",
        features: ['SMS', 'African markets', 'Low cost'],
        pricing: 'Pay per message',
        documentation: 'https://developers.africastalking.com/docs/sms/overview'
      },
      nexmo: {
        name: 'Nexmo (Vonage)',
        features: ['SMS', 'MMS', 'Global coverage'],
        pricing: 'Pay per message',
        documentation: 'https://developer.vonage.com/messaging/sms/overview'
      }
    };

    return {
      current: instance.provider,
      configured: instance.client !== null,
      details: providerDetails[instance.provider] || {
        name: 'Unknown'
      },
      allProviders: Object.keys(providerDetails)
    };
  }

}