const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RECIPIENT_EMAIL = process.env.CONTACT_TO_EMAIL || "ahmedhelmybusniess123@gmail.com"
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || "devHELMY Portfolio <onboarding@resend.dev>"

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character])
}

module.exports = async function contactHandler(request, response) {
  response.setHeader("Cache-Control", "no-store")

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST")
    return response.status(405).json({ ok: false, error: "Method not allowed." })
  }

  const body = request.body && typeof request.body === "object" ? request.body : {}
  if (typeof body.website === "string" && body.website.trim()) {
    return response.status(200).json({ ok: true })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!name || name.length > 120) {
    return response.status(400).json({ ok: false, error: "Enter a name under 120 characters." })
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return response.status(400).json({ ok: false, error: "Enter a valid email address." })
  }
  if (!message || message.length > 5000) {
    return response.status(400).json({ ok: false, error: "Enter a message under 5,000 characters." })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return response.status(503).json({ ok: false, error: "Email is not configured yet. Please email me directly." })
  }

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>")

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [RECIPIENT_EMAIL],
        reply_to: email,
        subject: "New devHELMY portfolio contact",
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<h2>New portfolio contact message</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong><br>${safeMessage}</p>`,
      }),
    })

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.json().catch(() => ({}))
      console.error("Resend rejected a contact message:", errorBody.message || resendResponse.status)
      return response.status(502).json({ ok: false, error: "The email could not be sent. Please try again or email me directly." })
    }

    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error("Resend request failed:", error.message)
    return response.status(502).json({ ok: false, error: "The email could not be sent. Please try again or email me directly." })
  }
}
