import React from "react";
import Layout from "components/Layout";
//import Loading from "components/Loading";

export default function Privacy() {
  return (
    <Layout>
      <h1>Privacy Policy:</h1>
      <h2>In order for TrackTask to function, we have to collect some information. Here&apos;s what we collect and how we use it...
      <ul>
        <li>TrackTask is deployed to the web using <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a>. This platform allows us to easily develop the site and provides us with some site performance analytics & API request logging. You should review their Privacy Policy and Terms of Use on their website for more information.</li>
        <li>For DNS and security, we use Cloudflare to protect our domains and prevent abuse of our services. You should read their <a href="https://www.cloudflare.com/privacypolicy" target="_blank" rel="noreferrer">Privacy Policy</a> to see what information they collect and how they use it.</li>
        <li>To prevent spam, login and signup require Google&apos;s reCAPTCHA service, please review their <a href="https://www.google.com/intl/en/policies/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://www.google.com/intl/en/policies/terms" target="_blank" rel="noreferrer">Terms of Service</a>.</li>
        <li>We collect information on signup and login, including usernames, hashed passwords, email & IP addresses, and timestamps, as well as any other information explicitly input by the user.</li>
        <li>Information explicitly entered and submitted to TrackTask, including user information, tasks, collections, and reports, is saved to our database and becomes accessible throughout the site as follows:</li>
        <ul>
          <li><b>User information:</b> Viewable by administrators, select information is viewable by users in shared collections (usernames, profile pictures).</li>
          <li><b>Tasks:</b> Not shared, only viewable by the user who created it.</li>
          <li><b>Collections:</b> Only viewable by the user who created it and any user it is shared with (if applicable). Administrators can view all shared collections.</li>
          <li><b>Reports:</b> Viewable by administrators, not shared with non-admin users.</li>
        </ul>
      </ul>
      <p>The above information is collected to allow the site to function correctly & securely, and so our development team can provide fixes and new features for TrackTask users.</p>
      <h3>We legally cannot collect information from users under 13 years of age without parental consent, if you are a user or parent of a user under 13, please contact <pre>privacy@tracktask.eu.org</pre> to have your information removed.</h3>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
