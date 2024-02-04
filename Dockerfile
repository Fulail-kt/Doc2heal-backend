
# # Use the official Node.js Alpine image
# FROM node:alpine

# # Set the working directory inside the container
# WORKDIR /app

# # Copy the package.json and package-lock.json files to the working directory
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application files
# COPY . .

# # Copy environment variables
# ENV jwtKey = process.env.JWT_SECRET_KEY;
# ENV refreshKey = process.env.JWT_REFRESH_KEY;

# # MongoDB URI
# ENV MONGO_URI="mongodb+srv://muhamedfulail77:23kqD2Uk4kgzCf5f@cluster0.vkypwrx.mongodb.net/?retryWrites=true&w=majority"

# # Expose the port that your application will run on (if applicable)
# EXPOSE 3000

# # Start the application
# CMD ["npm", "start"]


# Use the official Node.js Alpine image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Set default values for environment variables
ENV JWT_SECRET_KEY="default-secret-key"
ENV JWT_REFRESH_KEY="default-refresh-key"
ENV MAIL_PASS="kjqeiclxjzbtjjmd"
ENV SECRET_STRIPE_KEY="sk_test_51OLmR8SJmqVejvmLolrT1nzPZYm8AwHYl4nkIX1ekPt53r0rqCppRMq0D78KxcvkhW7VWh2baX73WxWklaNrGGHL00pzsghBVk"

# MongoDB URI
ENV MONGO_URI="mongodb+srv://muhamedfulail77:23kqD2Uk4kgzCf5f@cluster0.vkypwrx.mongodb.net/?retryWrites=true&w=majority"

# Expose the port that your application will run on (if applicable)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
