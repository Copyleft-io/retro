# 2016 Static Showdown

<img src="app/images/retrofire.png">
## Project: ss16-retrofire  (a.k.a Retrofire)


### What is Retrofire?

### Core Features

### Core Components

- Angular JS (Super Hero Application Framework)
- Firebase   (Real-Time Database)
- Bootstrap  (CSS Framework)
- Font Awesome (Icon Framework)
- Node JS   (Server)
- NPM       (Backend Dependencies)
- Bower JS  (Frontend Dependencies)
- Grunt JS  (Task Runner)
- Travis CI (Build Server)  

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
