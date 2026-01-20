const axios = require('axios');

export default class infoBipProvider {

    static BASE_URL = process.env.INFOBIP_BASE_URL;
    static INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
    static async sendWhatsapp(to_phone: string, message: string) {
        try {
            const data = {
                "from": "+447860099299",
                "to": "+62895348736962",
                "messageId": "test-message-tes",
                "content": {
                    "text": "tes"
                },
                "callbackData": "Callback data"
            };
            const response = await axios.post(`${this.BASE_URL}/whatsapp/1/message/text`, data, {
                headers: {
                    'Authorization': `App ${this.INFOBIP_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log("[INFOBIP RESPONSE]", response.data);
        } catch (err: any) {
            console.log(err?.response?.data?.requestError?.serviceException?.validationErrors)
            // console.error("[INFOBIP ERROR]", err.response ? err.response.data : err.message);
        }
    }
}