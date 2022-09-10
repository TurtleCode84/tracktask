export default function handler(req, res) {
  res.status(200).json({ message: 'Welcome to TrackTask!', status: 'online' })
}
