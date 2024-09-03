# Contributing to TrackTask

Thank you for your interest in making TrackTask a better platform! Please review the guidelines below, and then go ahead and [fork the repository](https://github.com/TurtleCode84/tracktask/fork) to get started with contributing. By contributing to this GitHub repository, you agree to all Contributor and Collaborator Guidelines, as applicable.

## Contributor Guidelines:
1. All commits to the `main` branch must be made through a pull request, with a few small exceptions made by the lead developer for urgent security fixes and minor fixes (like typos).
2. Leave a description of what you changed when you make a commit or pull request. This helps everyone understand your modifications and speeds up the review of your PR.
3. Collaborate! Ask for help if you need it, opinions are readily available!
4. Please be civil and constructive when reporting issues or communicating with others in this repository.
5. By contributing to this repository, you release your committed code to TrackTask and its lead developer in accordance with the [MIT License](/LICENSE).

## How can I contribute?
1. [Create a fork](https://github.com/TurtleCode84/tracktask/fork) for development and make your changes.
2. Submit a new [pull request](https://github.com/TurtleCode84/tracktask/pulls) with your contributions.
3. Wait for review by a member of our development team.
4. Address feedback and discuss potential revisions.
5. Your PR can be merged with `main` upon approval!

> As a short disclaimer, we are not able to implement every suggestion we receive, and by contributing you acknowledge that your modifications may or may not be added to the production codebase, regardless of approval status.

## Setting up a local instance for development
1. Create a fork of this repository.
2. We'll use Vercel to deploy our Next.js application, so go ahead and import the repository from Github to a new Vercel project, selecting the framework preset as "Next.js" if it isn't already.
3. Leave all of the build & output settings as they are. However, there are several Environmental Variables **required** for the site to function:

| Name                     | Description                                                                                             | Usage                |
|--------------------------|---------------------------------------------------------------------------------------------------------| -------------------- |
| `BLACKLIST`              | A list of words, separated by commas, that can't be used as emails or usernames. Can be blank.          | Abuse prevention     |
| `IPBAN`                  | A list of IPs, separated by commas, that can't be used to sign up or login. Can be blank.               | Abuse prevention     |
| `MONGODB_URI`            | The complete MongoDB connection URI for your database, should begin with `mongodb+srv://`               | Database connections |
| `NEXT_PUBLIC_ADVISORY`   | A optional message to show as a banner on all pages. Syntax: `color^message`. Can be blank, optional.   | Site-wide announcements |
| `NEXT_PUBLIC_MAXLENGTH_DESCRIPTION` | The maximum allowed length (in characters) for task and collection descriptions. | Abuse prevention |
| `NEXT_PUBLIC_MAXLENGTH_TITLE` | The maximum allowed length (in characters) for task and collection titles. | Abuse prevention |
| `NEXT_PUBLIC_NOTIFICATIONS_PUBLIC_KEY` | A valid [VAPID](https://web.dev/articles/push-notifications-web-push-protocol) public key. Can be blank, but only if you do not plan on using push notifications. | Push notifications   |
| `NOTIFICATIONS_AUTH_TOKEN` | A complex, random-generated string used as an authentication token for API requests to `/api/notifications`  | Push notifications   |
| `NOTIFICATIONS_PRIVATE_KEY` | A valid [VAPID](https://web.dev/articles/push-notifications-web-push-protocol) private key, matched to the public key set in `NEXT_PUBLIC_NOTIFICATIONS_PUBLIC_KEY`. Can be blank, but only if you do not plan on using push notifications. | Push notifications |
| `RECAPTCHA_SECRET`       | The secret key for a v3 [Google reCAPTCHA](https://www.google.com/recaptcha/about/) instance                                                       | Abuse prevention     |
| `SECRET_COOKIE_PASSWORD` | A complex, random-generated string, must be at least 32 characters long                                      | User authentication  |
| `SMTP_AUTH`            | Authentication details for sending account-related emails through SMTP. Syntax: `username:password`.      | Account-related emails |
| `SUPERADMIN`             | The ID of the main admin user, grants this user additional privileges and immunity. Can be blank.       | Administration       |

4. Click "Deploy" and verify that everything builds correctly. You should now be able to visit your deployed frontend.
5. In the GitHub repository, locate `/pages/_app.js` and find the `GoogleReCaptchaProvider` element. The parameter `reCaptchaKey` should have a site key already there, but you'll need to replace it with your own **v3** site key, corresponding to the reCAPTCHA secret key you put in the Environmental Variable `RECAPTCHA_SECRET`. If you don't have one, you can create it [here](https://google.com/recaptcha/admin).
6. After you have replaced and committed the new site key, go to your frontend and verify that the reCAPTCHA bar in the bottom right isn't showing any errors. Make sure your keys are for reCAPTCHA **v3**!

> Be patient, Next.js takes about a minute to build and deploy, so committed changes might not show up immediately. You can check on the status of deployments in the Vercel dashboard.

Depending on how you choose to host your MongoDB database, you may have a slightly different setup process, but we will be using MongoDB Atlas for our data storage.

7. From the MongoDB Atlas UI, start a new project. Name and members don't matter.
8. Create a new database (cluster), choose the setup options that make sense for your location and budget.
9. Within your new cluster, you will need to create a new database. Name this database `data` and the initial collection `users`.
10. Insert a new document into the `users` collection with this schema:

```js
{
  _id: ObjectId(/*default value*/),
  username: "foo",
  email: ""
}
```
>The `_id` property will populate with a default value when you create the new document. Leave this value as it is.

What this document does is give the database something to work with when logging in or creating users. You shouldn't need to initialize any of the other collections.

11. Still in the `users` collection, navigate to the "indexes" tab in the Atlas UI. Create a new index with these inputs:

Fields:
```js
{
  email: 1
}
```
Options:
```js
{
  unique: true
}
```

12. Go back to your deployment's frontend and check that creating a new account works! Make sure to put an email in the field, or you will get an error initially. (This resolves itself after the first account is created, so email can be optional after that.)

_After creating a user you should be able to change `permissions.admin` to `true` for your user via Atlas to gain full access to the admin features._

#### Now that you've finished setup, you can delete the "foo" user and start developing locally! 🥳

###### Last tested 11-04-2023, screenshots coming soon
