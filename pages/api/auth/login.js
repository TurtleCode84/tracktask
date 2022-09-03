export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({ message : 'Endpoint coming soon!' })
  } else {
    res.status(405).json({ error : 'method not allowed' })
  }
}
