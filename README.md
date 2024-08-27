# Northcoders News API

This project is a RESTful API for the Northcoders News application. It allows users to interact with articles, comments, users, and more through various endpoints.

For instructions, please head over to [L2C NC News](https://l2c.northcoders.com/courses/be/nc-news).

## Getting Started

To run this project locally, you'll need to set up environment variables to connect to your local databases.

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js
- PostgreSQL

### Setting Up Environment Variables

Since the `.env` files are not included in this repository, you will need to create them manually to run the project locally. Follow these steps:

1. **Create `.env` Files**

   You will need to create two `.env` files in the root directory of the project:

   - `.env.development`
   - `.env.test`

2. **Add the Following Environment Variables**

   Inside each of these files, add the following content:

   **`.env.development`** (for the development database):
   ```plaintext
   PGDATABASE=nc_news


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
