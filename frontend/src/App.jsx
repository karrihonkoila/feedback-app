import { useState, useEffect } from 'react';
import { Routes, Route, useParams, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Admin() {
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    supabase.from('feedback').select('*').then(({ data }) => setFeedbacks(data || []));
  }, []);

  const sendLink = async () => {
    const { data } = await supabase
      .from('feedback')
      .insert({ project_name: project, token: crypto.randomUUID() })
      .select()
      .single();

    await fetch('/api/send-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: data.token, project })
    });

    alert('Linkki lähetetty sähköpostiin!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Admin: Lähetä palaute-linkki</h1>
      <input placeholder="Asiakkaan email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '8px' }} />
      <input placeholder="Projekti" value={project} onChange={e => setProject(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '8px' }} />
      <button onClick={sendLink} style={{ padding: '10px 20px' }}>Lähetä</button>

      <h2 style={{ marginTop: '30px' }}>Palautteet</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Projekti</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Arvosana</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Kommentti</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map(f => (
            <tr key={f.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{f.project_name}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{f.rating || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{f.comment || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackForm() {
  const { token } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [project, setProject] = useState('');

  useEffect(() => {
    supabase.from('feedback').select('project_name').eq('token', token).single()
      .then(({ data }) => data && setProject(data.project_name));
  }, [token]);

  const submit = async () => {
    await supabase.from('feedback').update({ rating, comment }).eq('token', token);
    alert('Kiitos palautteesta!');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1>Anna palaute projektille:</h1>
      <h2>{project || 'Ladataan...'}</h2>
      <div style={{ margin: '15px 0' }}>
        <label>Arvosana: </label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
        </select>
      </div>
      <textarea
        placeholder="Kommenttisi..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={5}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={submit} style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
        Lähetä palaute
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div style={{ textAlign: 'center', marginTop: '50px' }}><h1>Tervetuloa!</h1><Link to="/admin">Siirry admin-sivulle</Link></div>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/feedback/:token" element={<FeedbackForm />} />
    </Routes>
  );
}
