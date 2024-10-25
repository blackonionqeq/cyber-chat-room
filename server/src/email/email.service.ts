import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer'

@Injectable()
export class EmailService {
	transporter: Transporter
	constructor() {
		this.transporter = createTransport({
			host: 'smtp.qq.com',
			port: 587,
			secure: false,
			auth: {
				user: 'blackonionqaq@foxmail.com',
				pass: 'bfpzvcbfiyeibjdd'
			}
		})
	}

	async sendMail({ to, subject, html }: { to: string, subject: any, html: string }) {
		await this.transporter.sendMail({
			from: { name: '来自聊天室', address: 'blackonionqaq@foxmail.com' },
			to, subject, html,
		})
	}
}
