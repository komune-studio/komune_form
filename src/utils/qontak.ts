const crypto = require('crypto');
import axios from 'axios';

export default class Qontak {
	static generateHeader = (method: string, pathWithQueryParam: string, contentType?: string) => {
		let datetime = new Date().toUTCString();
		let requestLine = `${method} ${pathWithQueryParam} HTTP/1.1`;
		let payload = [`date: ${datetime}`, requestLine].join('\n');
		let signature = crypto
			.createHmac('SHA256', process.env.MEKARI_API_CLIENT_SECRET)
			.update(payload)
			.digest('base64');

		return {
			'Content-Type': contentType || 'application/json',
			Date: datetime,
			Authorization: `hmac username="${process.env.MEKARI_API_CLIENT_ID}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`,
		};
	};

	static fetch = async (endpoint: string, method: string, body: any) => {
		try {
			const url = process.env.MEKARI_API_BASE_URL + endpoint;
			const options = {
				method: method,
				url: url,
				headers: this.generateHeader(method, endpoint),
				data: body && JSON.stringify(body),
			};

			const response = await axios(options);
			if (response?.data) {
				return response.data;
			}
		} catch (error: any) {
			console.log(error.toJSON());
			throw error;
		}
	};

	static fetchMultiPart = async (endpoint: string, method: string, formData: any) => {
		try {
			const url = process.env.MEKARI_API_BASE_URL + endpoint;
			const options = {
				method: method,
				url: url,
				headers: this.generateHeader(
					method,
					endpoint,
					'multipart/form-data; boundary=---011000010111000001101001'
				),
				data: formData,
			};

			const response = await axios(options);
			if (response.status == 200) {
				return response.data;
			}
		} catch (error: any) {
			console.log(error.toJSON());
			throw error;
		}
	};

	static sendInvitation = async (name: string, phone: string, title: string, invitation_link: string) => {
		const requestBody = {
			to_number: phone,
			to_name: name,
			message_template_id: 'cc0bb2df-bcb1-4d26-a4fd-fc0df88237f4',
			channel_integration_id: '149930ba-848e-4802-ab81-b9c8be186961',
			language: {
				code: 'id',
			},
			parameters: {
				header: {
					format: 'IMAGE',
					params: [
						{
							key: 'url',
							value: 'https://premiere-api.komunestudio.com/public/whatsapp_invitation_header.png',
						},
					],
				},
				body: [
					{
						key: '1',
						value: 'invitation_link',
						value_text: invitation_link,
					},
				],
			},
		};

		return await this.fetch('/qontak/chat/v1/broadcasts/whatsapp/direct', 'POST', requestBody);
	};

	static sendCheckInConfirmation = async (
		name: string,
		phone: string,
		title: string,
		studio_name: string,
		seats: string
	) => {
		const requestBody = {
			to_number: phone,
			to_name: name,
			message_template_id: 'e9b76cb8-70a0-40f3-ad98-68557fca750c',
			channel_integration_id: '149930ba-848e-4802-ab81-b9c8be186961',
			language: {
				code: 'id',
			},
			parameters: {
				body: [
					{
						key: '1',
						value: 'full_name',
						value_text: name,
					},
					{
						key: '2',
						value: 'title',
						value_text: title,
					},
					{
						key: '3',
						value: 'studio_name',
						value_text: studio_name,
					},
					{
						key: '4',
						value: 'seats',
						value_text: seats,
					},
				],
			},
		};

		this.fetch('/qontak/chat/v1/broadcasts/whatsapp/direct', 'POST', requestBody);
	};

	static sendReminderToUnansweredInvitation = async (name: string, phone: string, invitation_link: string) => {
		const requestBody = {
			to_number: phone,
			to_name: name,
			message_template_id: '118dc055-a0d3-4709-98b5-62cc5242c1e4',
			channel_integration_id: '149930ba-848e-4802-ab81-b9c8be186961',
			language: {
				code: 'id',
			},
			parameters: {
				body: [
					{
						key: '1',
						value: 'invitation_link',
						value_text: invitation_link,
					},
				],
			},
		};

		return await this.fetch('/qontak/chat/v1/broadcasts/whatsapp/direct', 'POST', requestBody);
	};

	static sendReminderToAcceptedInvitation = async (name: string, phone: string) => {
		const requestBody = {
			to_number: phone,
			to_name: name,
			message_template_id: 'fedaf1eb-5d3d-4696-927c-ee5549a0dc40',
			channel_integration_id: '149930ba-848e-4802-ab81-b9c8be186961',
			language: {
				code: 'id',
			},
			parameters: {},
		};

		return await this.fetch('/qontak/chat/v1/broadcasts/whatsapp/direct', 'POST', requestBody);
	};

	static uploadImage = async (file: any) => {
		this.fetchMultiPart('/qontak/chat/v1/file_uploader', 'POST', file);
	};
}
