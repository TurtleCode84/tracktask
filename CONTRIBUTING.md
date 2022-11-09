# Contributing to TrackTask

... introduction coming soon ...

## Setting up a local instance for development
1. Create a fork of this repository. Make sure to uncheck "copy the main branch only" if you want to develop using the `dev` branch instead.
2. We'll use Vercel to deploy our Next.js application, so go ahead and import the repository from Github to a new Vercel project, selecting the framework preset as "Next.js" if it isn't already.
3. Leave all of the build & output settings as they are. However, there are a few Environmental Variables **required** for the site to function:

| Name                     | Value                                                                                                          |
|--------------------------|----------------------------------------------------------------------------------------------------------------|
| `MONGODB_URI`            | The complete MongoDB connection URI for your database, should begin with `mongodb+srv://`                      |
| `RECAPTCHA_SECRET`       | The secret key for a v3 Google reCAPTCHA                                                                       |
| `SECRET_COOKIE_PASSWORD` | A randomly generated string _at least_ 32 characters long                                                      |
| `BLACKLIST`              | A list of words, separated by commas, that can't be used as emails or usernames. Can be blank.                 |
| `IPBAN`                  | _Deprecating_, a list of IPs, separated by commas, that can't be used to sign up or login. Can be blank.       |
| `SUPERADMIN`             | The ID of the main admin user, grants this user additional privileges and immunity. Can be blank.              |
| `MAINTENANCE`            | Setting this to `true` will allow users to visit `/maintenance`, used with a Cloudflare redirect. Can be blank.|

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
