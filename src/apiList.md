# DevTinder APIs

## authRouter

- POST/signup
- POST/login
- POST/logout

## profileRouter

- GET/profile/view
- PATCH/profile/edit
- PATCH/profile/password

## connectionRequestRouter

<!-- - POST /request/send/interested/:userId
- POST /request/send/ignored/:userId -->

- POST /request/send/:status/:userId

<!-- - POST request/review/accepted/:requestId
- POST request/review/reject/:requestId -->

- POST request/review/:status/:requestId

## userRouter

- GET / user/requests/recieved
- GET user/connections
- GET /feed
