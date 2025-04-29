# Fly-Next

## Local Setup

In order to set up this project on your system, make sure to use the correct

To run this project locally, simply enter the following commands in order (make sure the scripts have execute permissions as well):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/myapp // provide a database URL here, your local database (this URL is easier because the dockerfile simply sets this one up)
JWT_SECRET= // provide a JWT secret of your choice here
FLIGHT_API_KEY= // provide an API key to work with the AFS API
```


```bash
./start.sh
./import-data.sh
```

If you want to stop the service, make sure you run the following:

```bash
./stop.sh
```

## Deployed Version

You can also check out the live deployment [here](https://fly-next-group-189.vercel.app)
