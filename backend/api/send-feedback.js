const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, token, project } = req.body;

  try {
    await resend.emails.send({
      from: 'Palaute <palaute@resend.dev>',
      to: email,
      subject: `Anna palaute: ${project}`,
      html: `<p>Hei!<br><br>Anna palautteesi projektille <strong>${project}</strong>:<br>
             <a href="https://${req.headers.host}/feedback/${token}">Siirry lomakkeelle</a></p>`
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
