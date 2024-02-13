import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as process from 'process'
import { Auth, google } from 'googleapis'
import * as fs from 'node:fs'
import * as path from 'node:path'

@Injectable()
export class EmailService {
  private readonly oAuth2Client: Auth.OAuth2Client

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.EMAIL_CLIENT_ID,
      process.env.EMAIL_CLIENT_SECRET,
      process.env.EMAIL_REDIRECT,
    )
    this.oAuth2Client.setCredentials({ refresh_token: process.env.EMAIL_REFRESH_TOKEN })
  }

  async sendMail({ email, code }: { email: string; code: number }) {
    try {
      const accessToken = (await this.oAuth2Client.getAccessToken()) as string

      const transport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: process.env.AUTHORIZED_EMAIL_ADDRESS,
          clientId: process.env.EMAIL_CLIENT_ID,
          clientSecret: process.env.EMAIL_CLIENT_SECRET,
          refreshToken: process.env.EMAIL_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      })

      const filePath = path.join(__dirname, '../src/email/lib/', 'mail-code.html')
      const htmlTemplate = fs.readFileSync(filePath, 'utf-8')
      const formattedHtml = htmlTemplate.replace('<verification_code>', code.toString())

      const mailOptions = {
        from: `Ify <${process.env.AUTHORIZED_EMAIL_ADDRESS}>`,
        to: email,
        subject: 'Confirm your email address\n',
        html: formattedHtml,
      }

      await transport.sendMail(mailOptions)

      return { sendMail: true }
    } catch (error) {
      return error
    }
  }
}
