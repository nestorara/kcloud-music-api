FROM node:18 as builder

ENV NODE_ENV=dev

# Create app directory
WORKDIR /usr/src/app

# Copy all content of actual dir to /app dir in container
COPY . .

# Install dependencies
RUN npm install

# transpile typescript code to javascript for production
RUN npm run build


FROM node:18

ENV NODE_ENV=production

WORKDIR /app

# Copy package.json and package-lock.json with dependecies of the proyect
COPY package*.json ./

# Create dist direcoroty becuase copy command copy content of directory
RUN mkdir /app/dist

# Copy distribution code
COPY --from=builder /usr/src/app/dist ./dist

# Chnge propetary and permissions for the node user
RUN chown node:node -R /app && chmod 700 -R /app

# Run the follwing commands as node user
USER node

# Install prodution dependencies
RUN npm install

# Run the production server
CMD [ "npm", "start" ]
