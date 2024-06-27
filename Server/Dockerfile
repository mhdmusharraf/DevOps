# Use an official Node.js image as a base, specifying the version
FROM node:20.10.0

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install the dependencies using npm
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the application runs on
EXPOSE 5000

# Command to run the application using npm
CMD ["npm", "start"]
