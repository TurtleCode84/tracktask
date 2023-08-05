# Contributing to TrackTask

Thank you for your interest in making TrackTask a better platform! Please review the guidelines below, and then go ahead and [fork the repository](https://github.com/TurtleCode84/tracktask/fork) to get started with contributing. By contributing to this GitHub repository, you agree to all Contributor and Collaborator Guidelines, as applicable.

## Contributor Guidelines:
1. **Don't** commit directly to the `main` branch, only commit as a PR.
2. Leave a description of what you changed when you make a commit or pull request. This helps everyone understand your modifications and speeds up the review of your PR.
3. Collaborate! Ask for help if you need it, opinions are readily available!
4. Please be civil and constructive when reporting issues or communicating with others in this repository.
5. By contributing to this repository, you release your committed code to TrackTask and the Lead Developer in accordance with the [MIT License](/LICENSE).

## How do I contribute?
1. [Create a fork](https://github.com/TurtleCode84/tracktask/fork) for development and make your changes.
2. Submit a new [pull request](https://github.com/TurtleCode84/tracktask/pulls) with your contributions.
3. Wait for review by a member of our development team.
4. Address feedback and discuss potential revisions.
5. Your PR can be merged with `main` upon approval!

## Setting up a local instance for development
1. Create a fork of this repository.
2. We'll use Vercel to deploy our Next.js application, so go ahead and import the repository from Github to a new Vercel project, selecting the framework preset as "Next.js" if it isn't already.
3. Leave all of the build & output settings as they are. However, there are a few Environmental Variables **required** for the site to function:

| Name                     | Value                                                                                                   |
|--------------------------|---------------------------------------------------------------------------------------------------------|
| `MONGODB_URI`            | The complete MongoDB connection URI for your database, should begin with `mongodb+srv://`               |
| `RECAPTCHA_SECRET`       | The secret key for a v3 Google reCAPTCHA                                                                |
| `SECRET_COOKIE_PASSWORD` | A randomly generated string _at least_ 32 characters long                                               |
| `BLACKLIST`              | A list of words, separated by commas, that can't be used as emails or usernames. Can be blank.          |
| `IPBAN`                  | _Deprecating_, a list of IPs, separated by commas, that can't be used to sign up or login. Can be blank.|
| `SUPERADMIN`             | The ID of the main admin user, grants this user additional privileges and immunity. Can be blank.       |
| `NEXT_PUBLIC_ADVISORY`   | A optional message to show as a banner on all pages, useful for maintenance advisories. Syntax: `color,message`. Can be blank, optional.|

4. Click "Deploy" and verify that everything builds correctly. You should now be able to visit your deployed frontend.
5. In the GitHub repository, locate `/pages/_app.js` and find the `GoogleReCaptchaProvider` element. The parameter `reCaptchaKey` should have a site key already there, but you'll need to replace it with your own **v3** site key, corresponding to the reCAPTCHA secret key you put in the Environmental Variable `RECAPTCHA_SECRET`. If you don't have one, you can create it [here](https://google.com/recaptcha/admin).
6. After you have replaced and committed the new site key, go to your frontend and verify that the reCAPTCHA bar in the bottom right isn't showing any errors. Make sure your keys are for reCAPTCHA **v3**!

Depending on how you choose to host your MongoDB database, you may have a slightly different setup process, but we will be using MongoDB Atlas for our data storage.

7. From the MongoDB Atlas UI, start a new project. Name and members don't matter.
8. Create a new database (cluster), choose the setup options that make sense for your location and budget.
9. Within your new cluster, you will need to create a new database. Name this database `data` and the initial collection `users`.
10. Insert a new document into the `users` collection with this schema:

```
{
  { _id: ObjectId(<default value will be here>) },
  { username: "foo" },
  { email: "" },
}
```
What this does is give the database something to work with when logging in or creating users. You shouldn't need to initialize any of the other collections.

11. Still in the `users` collection, navigate to the "indexes" tab in the Atlas UI. Create a new index with these inputs:

Fields:
```
{"email": "1"}
```
Options:
```
{"unique":true}
```

12. Go back to your deployment's frontend and check that creating a new account works!

_After creating a user you should be able to change `permissions.admin` to `true` for your user via Atlas to gain full access to the admin features._

#### Now that you've finished setup, you can delete the "foo" user and start developing locally! 🥳

###### Last tested 10/18/22, screenshots coming soon
