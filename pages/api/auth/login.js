export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(404).json({ message: 'Endpoint coming soon!' })
  } else {
    res.status(404).json({ message: 'Try POSTing data instead!' })
  }
}
