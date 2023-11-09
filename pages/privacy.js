import React from "react";
import Layout from "components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <h1>Privacy Policy:</h1>
      <h3>In order for TrackTask to function, some information is collected by us and disclosed to select third parties. Here&apos;s what you need to know.</h3>
      <ul style={{ listStyle: "revert", margin: "revert" }}>
        <li>TrackTask is deployed to the web using Vercel. This platform allows us to easily develop the site and provides us with some site performance analytics & API request logging. You may review their  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a> for more information on what they collect and how it is used.</li>
        <li>We use Cloudflare to protect our domains and prevent abuse of our services. You may read their <a href="https://www.cloudflare.com/privacypolicy" target="_blank" rel="noreferrer">Privacy Policy</a> to see what information they collect and how it is used.</li>
        <li>To prevent spam, signup requires the use of Google&apos;s reCAPTCHA service, you may review their <a href="https://www.google.com/intl/en/policies/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://www.google.com/intl/en/policies/terms" target="_blank" rel="noreferrer">Terms of Service</a>.</li>
        <li>This site, as many others do, uses cookies to facilitate site functionality. Such uses include storing of session tokens, user preferences, and identifiers used by Cloudflare and Google for anti-spam purposes. Additionally, our Push Notifications feature uses a service worker to provide communication with our notifications server. Use of cookies and service workers is voluntary, however we cannot guarantee the extent of the site&apos;s functionality without storing some information on your device.</li>
        <li>We, TrackTask, collect information on signup and login, including usernames, hashed passwords, email & IP addresses, and timestamps, as well as any other information explicitly input by the user.</li>
        <li>Information explicitly or implicitly entered and submitted to TrackTask, categorized as user information, tasks, collections, or reports, is saved to our database and becomes accessible throughout the site as follows:</li>
        <ul style={{ listStyle: "revert", margin: "revert" }}>
          <li><b>User information:</b> Includes username, email, IP addresses, timestamps, and profile picture. Viewable by administrators, select information is viewable by users in shared collections (username, profile picture).</li>
          <li><b>Tasks:</b> Includes task name, description, due date, priority, and completion timestamp. Viewable only by the user who created it, unless added by that same user to a shared collection. In this case, it may be seen by all users the collection is shared with, and may be modifiable by users with the correct permissions. Administrators can only view tasks that have been reported by a user with access to that task.</li>
          <li><b>Collections:</b> Includes collection name, description, and tasks within the collection. Only viewable by the user who created it and any user it is shared with, if sharing is enabled. Administrators can only view collections that have been reported by a user with access to that collection, in which case the administrator will have access to the collection&apos;s tasks as well.</li>
          <li><b>Reports:</b> Includes reported user/task/collection and report reason. Viewable by administrators, never shared with non-admin users.</li>
        </ul>
      </ul>
      <p>The above information is collected and distributed to allow the site to function correctly & securely, and so our development team can provide fixes and new features for TrackTask users. For questions and concerns related to your privacy on TrackTask, please contact the email linked below.</p>
      <h3>We legally cannot collect information from users under 13 years of age without parental consent, if you are a user or parent of a user under 13, please contact <a href="mailto:privacy@tracktask.eu.org">privacy@tracktask.eu.org</a> to have your information removed.</h3>
      <p style={{ fontStyle: "italic" }}>This page was last updated 11-08-2023.</p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
