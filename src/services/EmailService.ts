import nodemailer, {SentMessageInfo} from 'nodemailer'
import moment from 'moment'
import {Stream} from "stream";
import cryptoUtils from "../utils/crypto";
require('moment/locale/id')
const USER = process.env.MAILJET_USERNAME
const PASS = process.env.MAILJET_PASSWORD
const SERVICE = 'Mailjet'
// import 'moment/locale/id'

const replaceEmailTemplate = (replacer: any, emailTemplate: string) => {
    let oldTemplate = emailTemplate
    do {
        oldTemplate = emailTemplate
        for (let key in replacer) {
            emailTemplate = emailTemplate.replace(`%${key}%`, replacer[key])
        }
    } while (emailTemplate !== oldTemplate)

    return emailTemplate
}

interface MailAttachment {
    filename?: string,
    content?: string | Buffer | Stream,
    path?: string,
    encoding?: string,
    raw?: string
}

interface IAdditionalConfiguration {
    attachments?: MailAttachment[],
    replyTo?: string,
    textMode?: boolean, //If true, will pass email as text. if false, will pass email as RichText/HTML
    fromDomain?: string,
    fromName?: string
}

const sendEmailAsync = async (to: string, subject: string, body: string, config?: IAdditionalConfiguration): Promise<SentMessageInfo> => {

    let fromDomain = config?.fromDomain ?? 'komunestudio.com'
    let fromName = config?.fromName ?? 'no-reply'
    let from = `${fromName}@${fromDomain}`

    let mailOptions: any = {
        from: from,
        to: to,
        subject: subject,
    };

    if (config?.replyTo) {
        mailOptions.replyTo = config?.replyTo
    }

    if (config?.textMode) {
        mailOptions.text = body
    } else {
        mailOptions.html = body
    }

    if (config?.attachments) {
        if (config.attachments.length > 0) {
            mailOptions.attachments = config.attachments
        }
    }

    let transporter = nodemailer.createTransport({
        service: SERVICE,
        auth: {
            user: USER,
            pass: PASS
        }
    })

    let result: SentMessageInfo = await transporter.sendMail(mailOptions)
    {
        response: "TEST-" + cryptoUtils.generateSalt() + " EMAILTEST"
    }

    console.log(result)

    let guid = result.response.split(" ").pop()

    console.log(`Sent email to [${to}] with subject [${subject}]. EMAIL GUID: ${guid}`)


    /*let emailStatus = new EmailStatus({
        email_guid: guid,
        from_address: from,
        to_address: to,
        subject: subject,
        content: text,
        status: EmailStatus.statuses.SENT
    }, ModelModes.CREATE)

    //catch this error so that it doesnt break the user-end flow
    try{
        await EmailStatus.create(emailStatus)
    } catch (err) {
        console.error(err)
    }*/

    return result

}


export default {
    sendEmailAsync,
    replaceEmailTemplate
}
