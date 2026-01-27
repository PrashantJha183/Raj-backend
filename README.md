# OTP-Based Authentication API (Supabase + Node.js)

A production-grade OTP authentication system built with Node.js, Express, Supabase (PostgreSQL), and JWT.

## Features

- User registration
- OTP-based login via email
- Secure OTP verification
- JWT access & refresh tokens
- Rate limiting & cooldowns
- Swagger API docs
- Jest test setup

## Tech Stack

Node.js, Express, Supabase, JWT, Nodemailer, Zod, Swagger, Jest

## Auth Flow

1. Register (no OTP)
2. Login (send OTP)
3. Verify OTP (issue tokens)
4. Access protected routes
5. Refresh token
6. Logout

## Environment Variables

See `.env` for required variables.

## Run Locally

npm install
npm run dev

## Test

npm test
