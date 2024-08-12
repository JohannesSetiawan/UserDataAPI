
# Hangry MSIB 7 - Johannes Setiawan - Backend Engineer - Test Results

## How to start the server

1. Run ```npm install``` to install all dependencies.
2. Create .env file and set ```DATABASE_URL``` variable with your database URL
3. Run ```npx prisma generate``` to load yoru environtment variable to prisma
4. Run ```npx prisma migrate dev``` to migrate prisma schema to your database.
5. Run ```npm run start``` to start the server.

## Documentation
- ```POST /users``` = Create new user. Name and email must be unique.
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

- ```GET /users``` = Get all created users.
Sample response body:
```
[
    {
        "id": "user-id-1",
        "name": "nama1",
        "email": "nama1@email.com",
        "dateofbirth": "2002-12-21T00:00:00.000Z"
    },
    {
        "id": "user-id-2",
        "name": "nama2",
        "email": "nama2@email.com",
        "dateofbirth": "2002-12-21T00:00:00.000Z"
    }
]
```

- ```GET /users/:id``` = Get all created users with specified Id. This API is server-side cached for 1 hour.
Sample response body:
```
{
    "id": "user-id1",
    "name": "nama1",
    "email": "nama1@email.com",
    "dateofbirth": "2002-12-21T00:00:00.000Z"
}
```

- ```POST /users/:Id``` = Update user with specified Id. Name and email must be unique.
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

- ```DELETE /users/:Id``` = Delete user with specified Id