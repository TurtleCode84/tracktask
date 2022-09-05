import type { User } from './user'

import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await req.body

  try {
    // get user data from mongodb, authenticate username/pwd, update DB session, store user session
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions)
