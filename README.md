# Kcloud-music-api

![Diagram of how the song api works](song%20API%20diagram.png)

The kcloud Music project api to manage songs on its own platform. With this api you can upload your songs and download them later, share them if you want or even integrate it with other applications.

***Note:*** The api still lacks authentication, so use it with caution.

The project requires a mongoose database and aws s3 or an object server that supports the s3 protocol. If you don't have any of the servers mentioned above, search the internet for how to create an s3 compatible storage server object or install docker and follow the steps.

***Second note:*** When we refer to an s3 storage server we mean a server that stores data as an object and we are not just talking about aws s3 storage.

## But... What is an storage server object?

Object storage is a technology that stores and manages data in an unstructured format called objects. These unstructured data can be like photos, videos, email, web pages, audio, etc. What does this mean?, means that instead of saving your data as files following a hierarchical structure such as directories, as well as the ability to store content that cannot be stored directly in a file for reasons of complexity, efficiency, etc.

Along with this unstructured data, a series of metadata is also stored, in which the name of the data to be stored is specified, your last access date, acl, bucket it belongs to, etc. A bucket to understand it better is a name that can be given to a grouping of this data, To simplify it, it is as if we could create different virtual hard drives and store the data there., How to store the audio or the cover of the songs with this api.


## What is an access key and secret key in storage server?

The access key and secret key are a combination of credentials equivalent to a username and password, but for machine access to the bucket (they should not be used to log in).


## Enviroment variables

 | Env               | Description                                     | Required | Default value |
 |:----------------- |:----------------------------------------------- |:--------:|:-------------:|
 | PORT              | Port on which the api server will run           |    no    |     3000      |
 | DB_HOST           | IP or Domain Name of your mongodb database      |   yes    |     none      |
 | DB_PORT           | Port that mongodb is running on                 |    no    |     27017     |
 | DB_DATABASE       | Database name                                   |    no    |     songs     |
 | DB_USER           | Username of Mongodb                             |    no    |     none      |
 | DB_PASSWORD       | Password for mongodb user                       |    no    |     none      |
 | BUCKET_NAME       | S3 storage server bucket name                   |   yes    |     none      |
 | BUCKET_ACCESS_KEY | Access key with permission on the bucket        |   yes    |     none      |
 | BUCKET_SECRET_KEY | Secret key of the access key                    |   yes    |     none      |
 | BUCKET_ENDPOINT   | S3 storage server URL                           |   yes    |     none      |
 | BUCKET_REGION     | S3 storage server region                        |   yes    |     none      |
 | MAXFILESIZE       | Maximum size per file to upload                 |    no    |     2 GiB     |
 | SHARED_MUSIC      | Enable the possibility of sharing music via url |    no    |     false     |


## Initialize the project

If you want to run the API on an online hosting server, you need to find a hosting that supports publishing JavaScript projects and find instructions on how to do it on the same or buy a vps follow the steps below and when you install go to the Alternative method section.

Open a console and access the directory where the project will be located, then clone the repository using the following command in the console:

```bash
git clone https://github.com/nestorara/kcloud-music-api.git
```

***Note:*** To proceed you will need to have git installed or alternatively you can download the zip by clicking on the code button in this page and clicking on download zip and extract the zip file.

The next thing to do is to create a file called .env in the root folder of the project and create the environment variables described in the environment variables section in the format:

```
PORT=<value>
```

Where PORT is the variable name and \<value\> is the value corresponding to the environment variable.

If you are wondering what an environment variable is, it is a storage value in your server's memory that stores data temporarily while the program is running or the computer is shut down.

The .env file you create above will be read by the api to create the corresponding environment variables in memory for execution. An example file called .env-example is available in the same folder with some examples that you can use as a guide. Variables start with # is a commented line, this means the variable will not be read, the commented lines in the example are just for illustration and in case you want to change or set a value if correponding.

Then, you should follow the following guidelines depending on what you are going to do and the technology you are going to use.

## Installation

### Docker

The Docker engine and docker-compose must be installed on the machine before proceeding with the instructions.

Containerized installation is the easiest way to install the api. There is no public image available, so you can follow these steps:

Open a console, access the location of the project folder and run the following command:

```bash
docker build -t <image name> .
```

This command generates an image for the docker container that is then executed.

Next you will need to set up a file called docker-compose.yaml, if you have an existing mongodb database and want to use this or if you want to use a separate machine for the database or s3 storage you can delete the relevant section. The s3 storage server corresponding to the minio section.

![](examples/docker compose sections.png)

Replace the nestor/songs-api:latest image with the name of your previously created image.

Finally run the following command to start the api server:

```bash
docker compose -f docker-compose.yaml up -d
```

If you run s3 storage server with minio, you can follow below steps in Configuring minio server section.

## Alternative method

For the following steps, you must have nodejs >= 7.5.0 installed on your machine.

If you do not want to use docker, you can still run it by following the steps below:

First convert typescript to javascript code using the command:

```bash
npm run build
```

This command generates a dist folder with the javascript code used to start the server.

Finally start the server with these command:

```bash
npm start
```


## Configure minio server

If you are using the minio server with docker, you must have the MINIO_ROOT_USER and MINIO ROOT PASSWORD variables in the .env file before you run the docker compose command in the install section and continue configuring the minio server.

***Note:*** The minimum length of the password is 8 digits, if it is not, it will cause an error in the execution of the server.

If you have a minio server as you storage server object or run it into a docker container, you can have the next to to configure the api to use the minio server.

In a browser to the control panel introducing the IP of minio server (in docker is the same IP as the docker server) below two points and 9001.

**Example url:** http\[s\]://192.168.1.4:9001

***Note:*** The http\[s\] must be changed base on if your minio server use http or https, this can change depending how to configure the server. If you use the example docker compose to deploy minio server the protocol is http.

Login in the control panel with your credential (if you run this in Docker the credentials found in .env file named MINIO_ROOT_USER and MINIO_ROOT_PASSWORD corresponding).

![Minio server login page](minio%20configuration/Minio%20server%20login.png)

Next, create a new bucket clicking in create a bucket link.

![Create a new cube](minio%20configuration/Create%20new%20Bucket%20in%20Minio.png)

We establish a name and click on the create bucket button

![Set bucket name](minio%20configuration/Set%20Bucket%20name.png)

Now we need to create an access key and a secret key to allow the API to connect to our bucket. To do this we go to the access key section in the left panel and click on create access key.

![How to generate the access key and the secret key](minio%20configuration/Create%20the%20access%20key%20and%20secret%20key.png)

Here we will be shown the access code and the generated secret key, we will activate the switch restrict beyond user policy and paste the following policy, modify the tutorial to your bucket name.

![Assignment of the policy to the access key](minio%20configuration/Assing%20a%20policy%20to%20the%20acces%20key.png)

This policy allows you to do anything on the bucket that we have indicated with this credential, therefore, take the necessary measures.

the policy can be found in the minio resource folder named Access Key Policy.

Finally we show a windows to dowenload the credential or copy the credential in your clipboard and assign the values to your .env file.

![Pop-up window showing the access key and the generated secret key](minio%20configuration/Window%20to%20copy%20the%20credentials.png)


## Usage

**Song database scheme:**

|   Field   | Description                                                                                                                                      | Required |      Type       |
|:---------:|:------------------------------------------------------------------------------------------------------------------------------------------------ |:--------:|:---------------:|
|   name    | Name of song                                                                                                                                     |   yes    |     String      |
|  genres   | Genres to which the song belongs                                                                                                                 |    no    | List of strings |
|  artists  | Artists of song                                                                                                                                  |    no    | List of strings |
|  albums   | Albums the song belongs to                                                                                                                       |    no    | List of strings |
| songFile  | Audio file of song                                                                                                                               |   yes    |      File       |
|   cover   | Cover image of song                                                                                                                              |    no    |      File       |
| accountId | Whatever text you want, this field is not used yet and will be used to store the owner who creates the song and will not be needed in the future |   yes    |     String      |
| createdAt | Date of song creation (autogenerated)                                                                                                            |    no    |     ISODate     |
| updatedAt | Date of the last song update (autogenerated)                                                                                                     |    no    |     ISODate     |

**File database scheme:**

| Field    | Description                                      | Required |  Type  |
|:-------- |:------------------------------------------------ |:--------:|:------:|
| fileName | Name of the file stored on the S3 storage server |   yes    | String |
| size     | File size                                        |   yes    | Number |
| mimetype | File Mime Type                                   |   yes    | String |

**Song output by different endpoints:**

| Field     | Description                                  |
|:--------- |:-------------------------------------------- |
| \_id      | Unique identifier of song                    |
| name      | Name of song                                 |
| genres    | Genres to which the song belongs             |
| artists   | Artists of song                              |
| albums    | Albums the song belongs to                   |
| createdAt | Date of song creation (autogenerated)        |
| updatedAt | Date of the last song update (autogenerated) |


> To get the URL to share cover or audio of song the enviroment variable SHARED_MUSIC must be set to true, if this is not the case, an error ocurred indicating that this functionality is disabled and how to enable this.

![Error when SHARED_MUSIC is not enables](examples/Get%20URL%20restriction.png)


### EndPoints

### GET /songs

**Output:** List of all songs

![Song list](examples/List%20of%20songs.png)


### GET /songs/id

**id:** \_id field of the song you want to get information about

**Output:** Info of song you want to get

![Copy the id of a song from the list](examples/Get%20single%20song.png)

![Song obtained](examples/Get%20single%20song%202.png)

### POST /songs

**Body:**

| Field     | Description                                                                                                                                      | Required |          Type           |
|:--------- |:------------------------------------------------------------------------------------------------------------------------------------------------ |:--------:|:-----------------------:|
| name      | Name of song                                                                                                                                     |   yes    |         String          |
| cover     | Cover image of song                                                                                                                              |    no    |       audio file        |
| song      | Audio file of song                                                                                                                               |   yes    |       image file        |
| genres    | Genres to which the song belongs                                                                                                                 |    no    | comma separated strings |
| artists   | Artists of song                                                                                                                                  |    no    | comma separated strings |
| albums    | Albums the song belongs to                                                                                                                       |    no    | comma separated strings |
| accountId | Whatever text you want, this field is not used yet and will be used to store the owner who creates the song and will not be needed in the future |   yes    |         String          |

**Output:** The new song added

![Created song](examples/Create%20new%20song.png)


### PATH /songs/id

**id:** \_id field of the song you want to update

**Body:** The new fields that you want to update or change their value

![Updated song](examples/Update%20song.png)


### DELETE /songs/id

**id:** \_id field of the song you want to delete from

**Output:** The deleted song

![Deleted song](examples/Delete%20song.png)


### GET /download/songFile/id

**id:** \_id field of song you want to get info.

**Output:** The audio file of the song

![Audio file of the downloaded song](examples/Download%20song%20audio.png)


### GET /download/cover/id

**id:** \_id field of the song you want to download the cover of

**Output:** The cover image file

![Downloaded cover](examples/Download%20song%20cover.png)


### GET /getURL/songFile/id

**id:** \_id field of the song you want to get a url of the audio from

**Output:** URL of the audio of the song to be shared

![URL of the song audio](examples/Get%20URL%20of%20audio%20song.png)


### GET /getURL/cover/id

**id:** \_id field of the song you want to get a url of the cover from

**Output:** URL of the cover of the song to be shared

![URL of the song cover](examples/Get%20URL%20of%20cover%20song.png)


## Developers

To start the development server, you can follow the installation instructions above, but run the following command instead of the npm run start command:

```bash
npm run dev
```


### Project structure

**index.ts:** Main file to execute the API.

**app.ts:** Configuration of the express library as middleware, routes to be added, etc.

**ZodSchemes.ts:** schemes and validation functions, such as validating whether it is a valid file, the fields required for the request, etc; used by the zod library.

**utils.ts:** Some auxiliary functions, such as whether the file is an audio file, database error handling, field filtering, etc.

**db.ts:** Connects to the database.

**config.ts:** load the environment variables and export their values as constants for use in all parts of the API.

**types.ts:** Data types for typescript.

**routes:** Defines the API paths (endpoints) and executes the corresponding function to process the request.

**controllers:** Functions that process requests when a client requests a route defined in the routes folder.

**libs:** Functions for error handling, file upload to s3 storage server, etc.

**middlewares:** Customized middlewares.

**models:** Schemas and models of the mongoose database.