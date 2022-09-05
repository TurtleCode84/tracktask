import withSession from '../util/session'

export const getServerSideProps = withSession(async function ({ req, res }) {
  const { user } = req.session

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: { user },
  }
})

const Dashboard = ({ user }) => {
  // Show the user. No loading state is required
  return (
    <h1>Your Profile</h1>
    <pre>{JSON.stringify(user, null, 2)}</pre>
  )
}

export default Dashboard
