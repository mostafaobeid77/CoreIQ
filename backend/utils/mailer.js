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
const MAILERSEND_SMTP_USER = sanitize(process.env.MAILERSEND_SMTP_USER)
const MAILERSEND_SMTP_PASSWORD = sanitize(process.env.MAILERSEND_SMTP_PASSWORD)
const BREVO_SMTP_USER = sanitize(process.env.BREVO_SMTP_USER)
const BREVO_SMTP_KEY = sanitize(process.env.BREVO_SMTP_KEY)

const mailDisabled = MAIL_DISABLED === 'true' || (!BREVO_SMTP_KEY && !MAILERSEND_SMTP_PASSWORD && !SENDGRID_API_KEY && (!MAIL_USER || !MAIL_APP_PASSWORD))

let transporter = null

const createTransporter = () => {
	if (mailDisabled) {
		console.log('[mailer] Email sending disabled. Skipping transporter creation.')
		return null
	}

	// Prefer Brevo (best deliverability to Hotmail/Yahoo, 300 emails/day free)
	if (BREVO_SMTP_KEY) {
		console.log('[mailer] Using Brevo (Sendinblue) for email delivery.')
		const transport = nodemailer.createTransport({
			host: 'smtp-relay.brevo.com',
			port: 587,
			secure: false,
			auth: {
				user: BREVO_SMTP_USER,
				pass: BREVO_SMTP_KEY,
			},
			connectionTimeout: 15000,
			greetingTimeout: 15000,
		})

		// Verify in background
		transport.verify()
			.then(() => {
				console.log('[mailer] Brevo transporter verified successfully.')
			})
			.catch((error) => {
				console.error('[mailer] Brevo verification warning (will still try to send):', error.message)
			})

		return transport
	}

	// Fallback to MailerSend
	if (MAILERSEND_SMTP_PASSWORD) {
		console.log('[mailer] Using MailerSend for email delivery.')
		const transport = nodemailer.createTransport({
			host: 'smtp.mailersend.net',
			port: 2525, // Use 2525 instead of 587 for better cloud platform compatibility
			secure: false,
			auth: {
				user: MAILERSEND_SMTP_USER,
				pass: MAILERSEND_SMTP_PASSWORD,
			},
			connectionTimeout: 15000, // Increase to 15 seconds for cloud platforms
			greetingTimeout: 15000,
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

