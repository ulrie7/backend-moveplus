// services/MessageDispatcher.js
const { CHANNELS } = require('./constants/channels.constants')
const SmsServices = require("../../services/sms.services")
const EmailServices = require("../../services/email.services")
const WhatsappServices = require("../../services/whatsapp.services")

class MessageDispatcher {

    static CHANNELS = CHANNELS

    /**
     * Send message through any channel with any template
     * @param {Object} locals - Data to populate template
     * @param {string} channel - Communication channel (sms/whatsapp/email)
     * @param {string} template - Template identifier
     * @returns {Promise<{sent: boolean, contactId: string, channel: string}>}
     */
    static async sendMessage(locals, channel, template) {
        try {
            switch (channel) {
                case CHANNELS.SMS:
                    return await MessageDispatcher.sendMessageViaSms(locals, template)

                case CHANNELS.WHATSAPP:
                    return await MessageDispatcher.sendMessageViaWhatsApp(locals, template)

                case CHANNELS.EMAIL:
                    return await MessageDispatcher.sendMessageViaEmail(locals, template)

                default:
                    throw new Error(`Unsupported channel: ${channel}`)
            }
        } catch (error) {
            console.error(`[MessageDispatcher.sendMessage] Failed to send via ${channel}:`, error.message)
            throw error
        }
    }

    /**
     * Send message via SMS
     * @private
     * @param {Object} locals - Message data
     * @param {string} template - Template identifier
     * @returns {Promise<{sent: boolean, contactId: string, channel: string}>}
     */
    static async sendMessageViaSms(locals, template) {
        try {
            if (!SmsServices) {
                throw new Error('SMS service is not configured')
            }

            const response = await SmsServices.sendSMS(locals.phoneNumber, locals, template)

            return {
                sent: Boolean(response.id),
                contactId: response.id,
                channel: CHANNELS.SMS
            }
        } catch (error) {
            console.error('[MessageDispatcher.sendMessageViaSms] SMS delivery failed:', error.message)
            throw new Error(`SMS delivery failed: ${error.message}`)
        }
    }

    /**
     * Send message via WhatsApp
     * @private
     * @param {Object} locals - Message data
     * @param {string} template - Template identifier
     * @returns {Promise<{sent: boolean, contactId: string, channel: string}>}
     */
    static async sendMessageViaWhatsApp(locals, template) {
        try {
            if (!WhatsappServices) {
                throw new Error('WhatsApp service is not configured')
            }

            const response = await WhatsappServices.sendWhatsapp(locals.phoneNumber, locals, template)

            return {
                sent: Boolean(response.id),
                contactId: response.id,
                channel: CHANNELS.WHATSAPP
            }
        } catch (error) {
            console.error('[MessageDispatcher.sendMessageViaWhatsApp] WhatsApp delivery failed:', error.message)
            throw new Error(`WhatsApp delivery failed: ${error.message}`)
        }
    }

    /**
     * Send message via Email
     * @private
     * @param {Object} locals - Message data
     * @param {string} template - Template identifier
     * @returns {Promise<{sent: boolean, contactId: string, channel: string}>}
     */
    static async sendMessageViaEmail(locals, template) {
        try {
            if (!EmailServices) {
                throw new Error('Email service is not configured')
            }

            const response = await EmailServices.sendEmail(locals.email, locals, template)

            return {
                sent: Boolean(response.id),
                contactId: response.id,
                channel: CHANNELS.EMAIL
            }
        } catch (error) {
            console.error('[MessageDispatcher.sendMessageViaEmail] Email delivery failed:', error.message)
            throw new Error(`Email delivery failed: ${error.message}`)
        }
    }

    /**
     * Check if a channel is available
     * @param {string} channel - Channel to check
     * @returns {boolean}
     */
    static isChannelAvailable(channel) {
        switch (channel) {
            case CHANNELS.SMS:
                return Boolean(SmsServices)
            case CHANNELS.WHATSAPP:
                return Boolean(WhatsappServices)
            case CHANNELS.EMAIL:
                return Boolean(EmailServices)
            default:
                return false
        }
    }
}

module.exports = MessageDispatcher