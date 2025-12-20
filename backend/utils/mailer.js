const nodemailer = require('nodemailer')

const sanitize = (value, { stripSpacesInside = false } = {}) => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return stripSpacesInside ? trimmed.replace(/\s+/g, '') : trimmed
}

const MAIL_USER = sanitize(process.env.MAIL_USER)
const MAIL_APP_PASSWORD = sanitize(process.env.MAIL_APP_PASSWORD, { stripSpacesInside: true })
const MAIL_FROM_NAME = sanitize(process.env.MAIL_FROM_NAME) || 'CoreIQ'
const MAIL_FROM_EMAIL = sanitize(process.env.MAIL_FROM_EMAIL)
const MAIL_DISABLED = sanitize(process.env.MAIL_DISABLED)
const SENDGRID_API_KEY = sanitize(process.env.SENDGRID_API_KEY)
const MAILERSEND_API_KEY = sanitize(process.env.MAILERSEND_API_KEY)

const mailDisabled = MAIL_DISABLED === 'true' || (!MAILERSEND_API_KEY && !SENDGRID_API_KEY && (!MAIL_USER || !MAIL_APP_PASSWORD))

let transporter = null

const createTransporter = () => {
	if (mailDisabled) {
		console.log('[mailer] Email sending disabled. Skipping transporter creation.')
		return null
	}

	// Prefer MailerSend (easiest signup, 3K emails/month free)
	if (MAILERSEND_API_KEY) {
		console.log('[mailer] Using MailerSend for email delivery.')
		const transport = nodemailer.createTransport({
			host: 'smtp.mailersend.net',
			port: 587,
			secure: false,
			auth: {
				user: 'MS_SMTP_USER', // MailerSend uses this generic username
				pass: MAILERSEND_API_KEY,
			},
			connectionTimeout: 10000, // 10 seconds
			greetingTimeout: 10000,
		})

		// Verify in background - don't block startup
		transport.verify()
			.then(() => {
				console.log('[mailer] MailerSend transporter verified successfully.')
			})
			.catch((error) => {
				console.error('[mailer] MailerSend verification warning (will still try to send):', error.message)
			})

		return transport
	}

	// Fallback to SendGrid
	if (SENDGRID_API_KEY) {
		console.log('[mailer] Using SendGrid for email delivery.')
		const transport = nodemailer.createTransport({
			host: 'smtp.sendgrid.net',
			port: 587,
			secure: false,
			auth: {
				user: 'apikey',
				pass: SENDGRID_API_KEY,
			},
		})

		transport.verify().then(() => {
			console.log('[mailer] SendGrid transporter verified successfully.')
		}).catch((error) => {
			console.error('[mailer] Unable to verify SendGrid transporter:', error.message)
		})

		return transport
	}

	// Fallback to Gmail SMTP
	console.log('[mailer] Using Gmail SMTP for email delivery.')
	const transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: MAIL_USER,
			pass: MAIL_APP_PASSWORD,
		},
	})

	transport.verify().then(() => {
		console.log('[mailer] Gmail transporter verified successfully.')
	}).catch((error) => {
		console.error('[mailer] Unable to verify transporter:', error.message)
	})

	return transport
}

transporter = createTransporter()

const getFromAddress = () => {
	if (MAIL_FROM_EMAIL) {
		return `${MAIL_FROM_NAME} <${MAIL_FROM_EMAIL}>`
	}
	if (MAIL_USER) {
		return `${MAIL_FROM_NAME} <${MAIL_USER}>`
	}
	return MAIL_FROM_NAME
}

exports.sendMail = async ({ to, subject, text, html }) => {
	if (mailDisabled || !transporter) {
		console.log(`[mailer] Email disabled. Unable to send "${subject}" to ${to}`)
		console.log(text)
		return
	}

	try {
		await transporter.sendMail({
			from: getFromAddress(),
			to,
			subject,
			text,
			html // <-- actually send HTML styling
		})
		console.log(`[mailer] Email sent to ${to} with subject "${subject}" (html: ${!!html})`)
	} catch (error) {
		console.error('[mailer] Failed to send email:', error.message)
	}
}

