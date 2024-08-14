# Hangry MSIB 7 - Johannes Setiawan - Backend Engineer - Test Results

## How to start the server

1. Run `npm install` to install all dependencies.
2. Create .env file and set `DATABASE_URL` variable with your database URL.
3. Run `npx prisma generate` to load your environtment variable to prisma.
4. Run `npx prisma migrate dev` to migrate prisma schema to your database.
5. Run `npm run start` to start the server.

## Integration Testing

There's a Postman Collection and Environtment that you can access [here](https://drive.google.com/drive/folders/1C2UkoLcXgA2v1CmOanqunQBez-a5UXCP?usp=sharing) to test this API. Most of the HTTP calls have their own testing script. Make sure to use the environment before you run the collection.

## API Documentation

-   `POST /api/users` = Create new user. Name and email must be unique.
    Sample request body:

```
{
    "name": "nama",
    "email": "email@email.com",
    "dateofbirth": "2002-12-21"
}
```

Sample response body:

```
{
    "id": "user-uuid-uuid",
    "name": "nama",
    "email": "email@email.com",
    "dateofbirth": "2002-12-21T00:00:00.000Z"
}
```

-   `GET /api/users` = Get all created users.
    Sample response body:

```
{
    "users": [
        {
            "id": "user-1",
            "name": "nama",
            "email": "nama@email.com",
            "dateofbirth": "2002-12-21T00:00:00.000Z"
        },
        {
            "id": "user-2",
            "name": "nama2",
            "email": "nama2@email.com",
            "dateofbirth": "2002-12-21T00:00:00.000Z"
        }
    ]
}
```

-   `GET /api/users/:id` = Get created users with specified Id. This API is server-side cached for 1 hour.
    Sample response body:

```
{
    "id": "user-id1",
    "name": "nama1",
    "email": "nama1@email.com",
    "dateofbirth": "2002-12-21T00:00:00.000Z"
}
```

-   `GET /api/users?name=name&email=email` = Get all created users with specified name and/or email.
    Sample response body:

```
{
    "users": [
        {
            "id": "user-1",
            "name": "nama",
            "email": "nama@email.com",
            "dateofbirth": "2002-12-21T00:00:00.000Z"
        }
    ]
}
```

-   `PUT /api/users/:Id` = Update user with specified Id. Name and email must be unique.
    Sample request body:

```
{
    "name": "nama-updated",
    "email": "email@email.com",
    "dateofbirth": "2002-12-21"
}
```

Sample response body:

```
{
    "id": "user-uuid-uuid",
    "name": "nama-updated",
    "email": "email@email.com",
    "dateofbirth": "2002-12-21T00:00:00.000Z"
}
```

-   `DELETE /api/users/:Id` = Delete user with specified Id

-   Common Errors

    -   Register/Update name and/or email with the same name and/or email as other user.

    ```
    {
        "message": "User name or email is already used!"
    }
    ```

    -   Missing field(s) on request body

    ```
    {
        "message": "\"<field-name>\" is required"
    }
    ```

    -   Requested user with specified Id not found

    ```
    {
        "message": "User not found!"
    }
    ```
