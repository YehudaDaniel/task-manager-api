# task-manager-api
Task manager api, a node-js application with:
 - jest (tests)
 - nodemon
 - mongodb (mongoose)
 
# Initialize
run `npm install`
## Initialize database
For using **mongodb** : create file on `./config/dev.env` and put `DATABASE_URL` field and fill it with your mongodb url
make sure to also include `PORT` with a port number inside that file in order for it to run on the desired port.

Also you can include `JWT_SECRET` with your own secret for the jsonwebtoken.
Last but not least, add `SENDGRID_API_KEY` in order for the **sendgrid** package to send welcome emails.

Example (dev.env):

```
DATABASE_URL=mongodb://<ADDRESS>/<COLLECTION NAME>
PORT=3000
SENDGRID_API_KEY=<YOUR API KEY>
JWT_SECRET=<JSONWEBTOKEN CUSTOM SECRET>
```

## Debugging
This project is customized with easy to use debugging tests.
For using the tests make sure to create file on `./config/test.env` and fill out the same variables as mentioned above, make sure to use 
a different databse url for testing.
run `npm test` to run tests.

run `npm dev` to run developement mode.
