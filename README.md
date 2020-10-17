# Cars API

## Description
Coding test for Ultra.io interview. This simple API lets you create cars, owners, and manufacturers.

## Run in docker

Download and install [docker](https://www.docker.com).
Clone the repository, and then navigate to the project's root directory in your terminal.

Run the following command
```bash
docker-compose up
```

Docker will then build the application container `carsapp` and the mongo container `nestmongo`. See [here](https://docs.mongodb.com/manual/installation/) for more instructions on how to do that.

Make sure that that ports 27017 and 3003 are clear.

Once both containers are up and running, go to `http://localhost:3003/api` for a description of all the API endpoints available in this app.


## Running locally
To run this app locally make sure that you have an instance of a mongodb database running in port 27071. You can set the login credentials and other configurations in the `.env` file in the projects root directory.

Also, be sure to change the value of `DB_HOST` in the `.env` file from `db` to `localhost`.

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
