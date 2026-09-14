/**
 * @WhatsappServices - Professional WhatsApp service for sending messages
 * Supports Twilio, WhatsApp Business API, MessageBird, and WasenderAPI
 */

const nunjucks = require('nunjucks');
const path = require('path');
module.exports = class WhatsappServices {

  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'twilio';
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

    // Add custom filters if needed
    this.templateEnv.addFilter('phone', (str) => {
      return str.replace(/[^\d+]/g, '');
    });

    this.templateEnv.addFilter('bold', (str) => {
      return `*${str}*`;
    });

    this.templateEnv.addFilter('italic', (str) => {
      return `_${str}_`;
    });

    this.templateEnv.addFilter('monospace', (str) => {
      return `\`\`\`${str}\`\`\``;
    });
  }
  /**
   * @initializeProvider - Initialize WhatsApp provider based on configuration
   */
  initializeProvider() {
    try {
      switch (this.provider.toLowerCase()) {
        case 'twilio':
          this.client = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
          break;

        case 'whatsapp-business':
          const axios = require('axios');
          this.client = axios.create({
            baseURL: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
          break;

        case 'messagebird':
          const messagebird = require('messagebird');
          this.client = messagebird(process.env.MESSAGEBIRD_API_KEY);
          this.channelId = process.env.MESSAGEBIRD_WHATSAPP_CHANNEL_ID;
          break;

        case 'wasenderapi':
          const axiosWasender = require('axios');
          this.client = axiosWasender.create({
            baseURL: process.env.WASENDER_API_URL || 'https://www.wasenderapi.com/api',
            headers: {
              'Authorization': `Bearer ${process.env.WASENDER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });
          break;

        default:
          console.warn(`WhatsApp Provider ${this.provider} not configured. Messages will be simulated.`);
          this.client = null;
      }
    } catch (error) {
      console.error('Failed to initialize WhatsApp provider:', error.message);
      this.client = null;
    }
  }
  /**
   * @sendWhatsapp - Send WhatsApp message using configured provider
   * @param {string} phoneNumber - Recipient phone number (E.164 format: +1234567890)
   * @param {object} locals - Template variables
   * @param {string} template - Template name (without .njk extension)
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  static async sendWhatsapp(phoneNumber, locals, template) {
    try {
      const instance = new WhatsappServices();
      return await instance.send(phoneNumber, locals, template);
    } catch (error) {
      if (process.env.WHATSAPP_SUPPRESS_ERRORS === 'true') {
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
      const messageData = await this.renderTemplate(template, locals);

      // Send based on provider
      let result;
      switch (this.provider.toLowerCase()) {
        case 'twilio':
          result = await this.sendViaTwilio(formattedPhone, messageData);
          break;
        case 'whatsapp-business':
          result = await this.sendViaWhatsAppBusiness(formattedPhone, messageData);
          break;
        case 'messagebird':
          result = await this.sendViaMessageBird(formattedPhone, messageData);
          break;
        case 'wasenderapi':
          result = await this.sendViaWasenderAPI(formattedPhone, messageData);
          break;
        default:
          result = await this.simulateSend(formattedPhone, messageData);
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
        console.error('WhatsApp message failed to send:', {
          phoneNumber,
          template,
          locals,
          error: error.message,
          stack: error.stack
        });
      }

      if (process.env.WHATSAPP_SUPPRESS_ERRORS === 'true') {
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

      return {
        type: 'text',
        text: renderedText.trim(),
        mediaUrl: locals.mediaUrl || null,
        mediaType: locals.mediaType || null,
        caption: locals.caption || null
      };

    } catch (error) {
      // If template file not found, treat template as direct text
      if (error.message.includes('template not found')) {
        console.warn(`Template ${template} not found, using as direct text`);
        return {
          type: 'text',
          text: template,
          mediaUrl: locals.mediaUrl || null,
          mediaType: locals.mediaType || null
        };
      }
      throw error;
    }
  }
  /**
   * @sendViaTwilio - Send WhatsApp message via Twilio
   */
  async sendViaTwilio(phoneNumber, messageData) {
    const whatsappNumber = phoneNumber.startsWith('whatsapp:') ?
      phoneNumber :
      `whatsapp:${phoneNumber}`;

    const params = {
      from: this.fromNumber,
      to: whatsappNumber,
      body: messageData.text
    };

    // Add media if present
    if (messageData.mediaUrl) {
      params.mediaUrl = [messageData.mediaUrl];
    }

    const result = await this.client.messages.create(params);
    return {
      messageId: result.sid
    };
  }
  /**
   * @sendViaWhatsAppBusiness - Send WhatsApp message via WhatsApp Business API
   */
  async sendViaWhatsAppBusiness(phoneNumber, messageData) {
    const cleanNumber = phoneNumber.replace(/\+/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanNumber,
      type: messageData.type || 'text'
    };

    if (messageData.type === 'template') {
      payload.template = {
        name: messageData.templateName,
        language: {
          code: messageData.languageCode || 'en'
        },
        components: messageData.components || []
      };
    } else if (messageData.mediaUrl) {
      // Send media message
      payload.type = messageData.mediaType || 'image';
      payload[payload.type] = {
        link: messageData.mediaUrl,
        caption: messageData.caption || messageData.text
      };
    } else {
      // Simple text message
      payload.text = {
        preview_url: false,
        body: messageData.text
      };
    }

    const response = await this.client.post(
      `/${this.phoneNumberId}/messages`,
      payload
    );

    return {
      messageId: response.data.messages[0].id
    };
  }
  /**
   * @sendViaMessageBird - Send WhatsApp message via MessageBird
   */
  async sendViaMessageBird(phoneNumber, messageData) {
    return new Promise((resolve, reject) => {
      this.client.conversations.start({
          to: phoneNumber,
          type: 'text',
          content: {
            text: messageData.text
          },
          channelId: this.channelId
        },
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              messageId: response.id
            });
          }
        }
      );
    });
  }
  /**
   * @sendViaWasenderAPI - Send WhatsApp message via WasenderAPI
   */
  async sendViaWasenderAPI(phoneNumber, messageData) {
    try {
      const payload = {
        to: phoneNumber,
        text: messageData.text
      };

      // Add media if present
      if (messageData.mediaUrl) {
        payload.url = messageData.mediaUrl;
        payload.caption = messageData.caption || messageData.text;

        // Remove text if we have a caption
        if (messageData.caption) {
          delete payload.text;
        }
      }

      const response = await this.client.post('/send-message', payload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send message via WasenderAPI');
      }

      return {
        messageId: response.data.data.msgId || response.data.data.jid,
        status: response.data.data.status || 'sent'
      };

    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data ? error.response.data.message : error.response.statusText;
        throw new Error(`WasenderAPI Error: ${errorMsg}`);
      }
      throw error;
    }
  }
  /**
   * @simulateSend - Simulate WhatsApp sending in development
   */
  async simulateSend(phoneNumber, messageData) {
    console.log('\n=== SIMULATED WHATSAPP MESSAGE ===');
    console.log(`Provider: ${this.provider}`);
    console.log(`To: ${phoneNumber}`);
    console.log(`Message:\n${messageData.text}`);
    if (messageData.mediaUrl) {
      console.log(`Media URL: ${messageData.mediaUrl}`);
      console.log(`Media Type: ${messageData.mediaType || 'unknown'}`);
      if (messageData.caption) {
        console.log(`Caption: ${messageData.caption}`);
      }
    }
    console.log('==================================\n');

    return {
      messageId: `wa_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'simulated'
    };
  }
  /**
   * @sendTemplateMessage - Send approved WhatsApp Business template
   */
  static async sendTemplateMessage(phoneNumber, templateName, components, languageCode = "en") {
    const instance = new WhatsappServices();

    if (instance.provider !== 'whatsapp-business') {
      throw new Error('Template messages are only supported with WhatsApp Business API');
    }

    const messageData = {
      type: 'template',
      templateName,
      languageCode,
      components
    };

    return await instance.send(phoneNumber, {}, messageData);
  }
  /**
   * @sendMediaMessage - Send WhatsApp message with media
   */
  static async sendMediaMessage(phoneNumber, text, mediaUrl, mediaType = "image", caption = null) {
    const instance = new WhatsappServices();
    const locals = {
      message: text,
      mediaUrl,
      mediaType,
      caption: caption || text
    };

    return await instance.send(phoneNumber, locals, 'MEDIA_MESSAGE');
  }
  /**
   * @sendBulkWhatsapp - Send WhatsApp messages to multiple recipients
   */
  static async sendBulkWhatsapp(phoneNumbers, locals, template) {
    const instance = new WhatsappServices();
    const results = [];
    const delayMs = process.env.WHATSAPP_BULK_DELAY || 1000;

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
   * @verifyWhatsAppNumber - Verify if phone number is registered on WhatsApp
   */
  static async verifyWhatsAppNumber(phoneNumber) {
    const instance = new WhatsappServices();

    try {
      const formatted = instance.formatPhoneNumber(phoneNumber);
      const isValid = instance.isValidPhoneNumber(formatted);

      return {
        valid: isValid,
        formatted: formatted,
        provider: instance.provider,
        note: 'Actual WhatsApp registration check requires Business API verification'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  /**
   * @getMessageStatus - Get delivery status of sent message
   */
  static async getMessageStatus(messageId) {
    const instance = new WhatsappServices();

    try {
      switch (instance.provider.toLowerCase()) {
        case 'twilio':
          const message = await instance.client.messages(messageId).fetch();
          return {
            messageId,
            status: message.status,
              errorCode: message.errorCode,
              errorMessage: message.errorMessage,
              provider: 'twilio'
          };

        case 'whatsapp-business':
          return {
            messageId,
            provider: 'whatsapp-business',
              note: 'Status updates available via webhook'
          };

        case 'wasenderapi':
          return {
            messageId,
            provider: 'wasenderapi',
              note: 'Status updates available via webhook. Check webhook events for delivery status.'
          };

        default:
          return {
            messageId,
            status: 'unknown',
              provider: instance.provider,
              note: 'Status check not supported for this provider'
          };
      }
    } catch (error) {
      return {
        messageId,
        error: error.message,
        provider: instance.provider
      };
    }
  }
  /**
   * @isValidPhoneNumber - Validate phone number format
   */
  isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;

    // Remove spaces, dashes, parentheses, whatsapp: prefix
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '').replace('whatsapp:', '');

    // Check if it starts with + and has 10-15 digits
    const e164Regex = /^\+[1-9]\d{9,14}$/;

    return e164Regex.test(cleaned);
  }
  /**
   * @formatPhoneNumber - Format phone number to E.164
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '').replace('whatsapp:', '');

    // If doesn't start with +, add country code
    if (!cleaned.startsWith('+')) {
      const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '+229'; // Benin
      cleaned = defaultCountryCode + cleaned;
    }

    return cleaned;
  }
  /**
   * @getProviderInfo - Get information about current provider
   */
  static getProviderInfo() {
    const instance = new WhatsappServices();

    const providerDetails = {
      twilio: {
        name: 'Twilio',
        features: ['Text', 'Media', 'Templates'],
        pricing: 'Pay per message',
        documentation: 'https://www.twilio.com/docs/whatsapp'
      },
      'whatsapp-business': {
        name: 'WhatsApp Business API',
        features: ['Text', 'Media', 'Templates', 'Official'],
        pricing: 'Conversation-based',
        documentation: 'https://developers.facebook.com/docs/whatsapp'
      },
      messagebird: {
        name: 'MessageBird',
        features: ['Text', 'Media', 'Conversations'],
        pricing: 'Pay per message',
        documentation: 'https://developers.messagebird.com/api/whatsapp/'
      },
      wasenderapi: {
        name: 'WasenderAPI',
        features: ['Text', 'Media', 'Low cost', 'Multiple sessions'],
        pricing: 'Flat rate ($6/month per session)',
        documentation: 'https://wasenderapi.com/api-docs'
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