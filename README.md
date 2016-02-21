# 2016 Static Showdown

<img src="app/images/retrofire.png">
## Retrofire (ss16-retrofire)

### What is Retrofire?
Old school innovation at it's finest built on a modern technology stack.

Retrofire is an open source innovation platform that is designed to stoke the creativity in your team. All the features you would expect... Tags, Voting, Views, and ElasticSearch designed on a real-time platform. This is the perfect place for Asking Questions, Launching Ideas, and Sharing Knowledge across your organization.

Built with <3 by the Hobbyists at Copyleft.io

### Core Features

#### Answer Burning Questions
Quickly put out the fires that are of greatest interest to your team! Give visibility to the questions that need very much to be answered.

#### Spark New Ideas
Turn up the lights and shine a spotlight on the creativity in your organization! Give visibility to the new ideas that your team generates everyday.

#### Fuel Knowledge Transfer
Knowledge is the kindling that sets change into motion! Give visibility to the thought leaders who fuel innovation on your team.

#### Firebase & Elastic Search
Index and Search in Real-Time
- Delivering immediate and actionable insight matters
- Update and Index your content in real-time through user interactions
- Tag your content to improve searchability and discovery
- Search all of your content from a single dashboard


### Core Components

- Angular JS (Super Hero Application Framework)
- Firebase   (Real-Time Database)
- Bootstrap  (CSS Framework)
- Font Awesome (Icon Framework)
- Node JS   (Server)
- NPM       (Backend Dependencies)
- Bower JS  (Frontend Dependencies)
- Grunt JS  (Task Runner)
- Travis CI (Hosted Build Server)  
- ElasticSearch (Hosted Server)

## Setup

### Download git project

Use git clone to download the project...

    $ git clone git@github.com:staticshowdown/ss16-retrofire.git

### Install Project Dependencies

Run npm install to install all backend node package dependencies...

    $ npm install

Run bower install for all frontend bower package dependencies...

    $ bower install

### Serve the Application with Livereload

Run grunt serve to confirm that everything is wired up...

    $ grunt serve

### Build & Deployment Process

As simple as build and deploy... literally

    $ grunt build

    $ grunt deploy

    *grunt build*

    - Clean out dist directory
    - Wire bower component dependencies into index.html
    - Minify, Concat, and Prefix application css and js dependencies
    - Copy dependencies into dist directory


    *grunt deploy*

    - Run grunt build task
    - Execute firebase deploy from command line

### ElasticSearch
You have a couple of options...
  - Spin up your own localhost:9200 via Node & NPM
  - Utilize Elastic.co (http://www.elastic.co/cloud) Found for a Free 14 Day Trial for Elastic as a Service in the cloud.

For this project we utilized Elastic.co Cloud Service... we built all of our elastic index creates, updates, and deletes directly into the user interactions (create, update, delete) for our components which was very easy to setup. Once your instance is live you will be provided with two URLs (HTTP / HTTPS). You will need to use the HTTP URL if you are hosting on firebase as all traffic will need to be over HTTPS.  We define this as a constant in our app.js


If you want to host a node.js synchronization process to listen for change events and update your indexes...

On a linux server of your choice install Node and NPM.

Run `npm init` to initialize a new node application

Add the following npm dependencies in a package.json

    "dependencies": {
      "elasticsearch": "^10.1.3",
      "firebase": "^2.4.0"
    }

Run `npm install` to install the dependencies.

Create a file elastic-firebase-client.js

    var Firebase = require('firebase');
    var ElasticSearch = require('elasticsearch');

    // initialize our ElasticSearch API
    var client = new ElasticSearch.Client({ host: '127.0.0.1:9200', log: 'trace' });

    // listen for changes to Firebase data
    var fb = new Firebase('https://<your firebase>.firebaseio.com/<type>');
    fb.on('child_added',   createOrUpdateIndex);
    fb.on('child_changed', createOrUpdateIndex);
    fb.on('child_removed', removeIndex);

    function createOrUpdateIndex(snap) {
       client.index({
         index: '<your project>',
         type: '<type>',
         body: snap.val()
       }, function (error, response) {
          if (error) {
            console.error(error);
          } else {
            console.log('indexed');
            console.log(response);
          }
      });
    };

    function removeIndex(snap) {
       client.deleteDocument(this.index, this.type, snap.key(), function(error, data) {
          if( error ) console.error('failed to delete', snap.key(), error);
          else console.log('deleted', snap.key());
       });
    };

Run the client using

    node elastic-firebase-client.js

A side note:  You can use PM2 (https://github.com/Unitech/pm2) as a Production Process Manager to configure this node service to run continuously... It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks.
