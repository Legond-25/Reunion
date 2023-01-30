FROM node:14

WORKDIR /app
COPY . /app

# Install dependencies
RUN npm install

# Run tests
RUN npm test

# Start the application
CMD ["npm", "start"]
EXPOSE 8080
