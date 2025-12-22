const sanitize = (value, { stripSpacesInside = false } = {}) => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return stripSpacesInside ? trimmed.replace(/\s+/g, '') : trimmed
}

const BREVO_API_KEY = sanitize(process.env.BREVO_API_KEY)
const MAIL_FROM_EMAIL = sanitize(process.env.MAIL_FROM_EMAIL)
const MAIL_FROM_NAME = sanitize(process.env.MAIL_FROM_NAME) || 'CoreIQ'
const MAIL_DISABLED = sanitize(process.env.MAIL_DISABLED)

const mailDisabled = MAIL_DISABLED === 'true' || !BREVO_API_KEY || !MAIL_FROM_EMAIL

if (mailDisabled) {
	console.log('[mailer] Email sending disabled. Missing BREVO_API_KEY or MAIL_FROM_EMAIL.')
} else {
	console.log('[mailer] Using Brevo Email API (HTTPS) for email delivery.')
}

/**
 * Send email via Brevo Email API (v3/smtp/email)
 * Uses HTTPS instead of SMTP to bypass Render port restrictions
 */
exports.sendMail = async ({ to, subject, text, html }) => {
	if (mailDisabled) {
		console.log(`[mailer] Email disabled. Unable to send "${subject}" to ${to}`)
		console.log(text)
		return
	}

	try {
		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'api-key': BREVO_API_KEY
			},
			body: JSON.stringify({
				sender: {
					name: MAIL_FROM_NAME,
					email: MAIL_FROM_EMAIL
				},
				to: [{ email: to }],
				subject: subject,
				textContent: text,
				htmlContent: html || text
			})
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`)
		}

		const result = await response.json()
		console.log(`[mailer] Email sent successfully to ${to} with subject "${subject}" (messageId: ${result.messageId})`)
	} catch (error) {
		console.error('[mailer] Failed to send email:', error.message)
		throw error
	}
}
