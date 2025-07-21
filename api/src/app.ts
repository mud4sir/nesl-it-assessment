// Import packages onto app
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Setup .env variables for app usage
dotenv.config();

// Import routes from the ./routes
import postRoute from "@/routes/post-route";
import authRoute from '@/routes/auth-route'
import { GlobalExceptionHandler } from "./middleware/error-middleware";

// Setup constant variables
const PORT = process.env.PORT || 5000;
const RATE_TIME_LIMIT = Number(process.env.RATE_TIME_LIMIT) || 15;
const RATE_REQUEST_LIMIT = Number(process.env.RATE_REQUEST_LIMIT) || 100;

// Init express app
const app = express();

// Body parser
app.use(express.json());

// Detailed server logging
app.use(morgan("dev"));

// Limit rate of requests
// Alternatively, you can pass through specific routes for different limits based on route
app.use(
  rateLimit({
    windowMs: RATE_TIME_LIMIT * 60 * 1000,
    max: RATE_REQUEST_LIMIT,
  }),
);

app.use(cors());
app.use(helmet());
app.use(hpp());

// Setup routing
app.use("/auth", authRoute);
app.use("/post", postRoute);

app.use(GlobalExceptionHandler);

// Listen to specified port in .env or default 5000
app.listen(PORT, () => {
  console.log(`Server is listening on: ${PORT}`);
});

export default app;