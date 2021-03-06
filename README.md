# Mobile Web Specialist Certification Course

## Three Stage Course Material Project - Restaurant Reviews
For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application.

## Project Overview: Stage 1
In Stage One, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification
You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality.

### What do I do from here?

* Fork and clone the [starter repository](https://github.com/udacity/mws-restaurant-stage-1). The code in this repository will serve as your baseline to begin development.
In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.
In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's website to download and install the software.
* You'll need your own [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key). Replace the text YOUR_GOOGLE_MAPS_API_KEY on line 37 of index.html with your own key.
* Convert the provided site to use a responsive design .
* Bootstrap and other CSS frameworks should not be used; all responsiveness should be done with CSS.
* Use appropriate document type declaration and viewport tags
* Create a responsive grid-based layout using CSS
* Use media queries that provide fluid breakpoints across different screen sizes
* Use responsive images that adjust for the dimensions and resolution of any mobile device
* Implement accessibility features in the site HTML (most of this HTML is generated by JavaScript functions).
* Add a ServiceWorker script to cache requests to all of the site’s assets so that any page that has been visited by a user will be accessible when the user is offline. Only caching needs to be implemented, no other ServiceWorker features.


With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
Write code to implement the updates to get this site on its way to being a mobile-ready website.
Note about ES6
Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.

## Project Overview: Stage 2
In Stage Two, you will take the responsive, accessible design you built in Stage One and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using Lighthouse.

### Specification
You will be provided code for a [Node development server](https://github.com/udacity/mws-restaurant-stage-2) and a README for getting the server up and running locally on your computer. The [README](https://github.com/udacity/mws-restaurant-stage-2/blob/master/README.md) will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will begin the 
work of improving your Stage One project code.

The core functionality of the application will not change for this stage. Only the source of the data will change. You will use the fetch() API to make requests to the server to populate the content of your Restaurant Reviews app.

### Requirements
**Use server data instead of local memory**

In the first version of the application, all of the data for the restaurants was stored in the local application. You will need to change this behavior so that you are pulling all of your data from the server instead, and using the response data to generate the restaurant information on the main page and the detail page.

**Use IndexedDB to cache JSON responses**
 
In order to maintain offline use with the development server you will need to update the service worker to store the JSON received by your requests using the IndexedDB API. As with Stage One, any page that has been visited by the user should be available offline, with data pulled from the shell database.

**Meet the minimum performance requirements**

Once you have your app working with the server and working in offline mode, you’ll need to measure your site performance using Lighthouse.

Lighthouse measures performance in four areas, but your review will focus on three:

* Progressive Web App score should be at 90 or better.
* Performance score should be at 70 or better.
* Accessibility score should be at 90 or better.
 
 You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

## Project Overview: Stage 3

### Project Overview
In Stage Three, you will take the connected application you built in Stage One and Stage Two and add additional functionality. You will add a form to allow users to create their own reviews. If the app is offline, your form will defer updating to the remote database until a connection is established. Finally, you’ll work to optimize your site to meet even stricter performance benchmarks than the previous project, and test again using Lighthouse.

### Specification
You will be provided code for an updated [Node development server](https://github.com/udacity/mws-restaurant-stage-3) and a README for getting the server up and running locally on your computer. The [README](https://github.com/udacity/mws-restaurant-stage-3/blob/master/README.md) will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will 
begin the work of improving your Stage Two project code.

This server is different than the server from stage 2, and has added capabilities. Make sure you are using the Stage Three server as you develop your project. Connecting to this server is the same as with Stage Two, however.

You can find the documentation for the new server in the [README](https://github.com/udacity/mws-restaurant-stage-3/blob/master/README.md) file for the server.

Now that you’ve connected your application to an external database, it’s time to begin adding new features to your app.

### Requirements
**Add a form to allow users to create their own reviews:**

In previous versions of the application, users could only read reviews from the database. You will need to add a form that adds new reviews to the database. The form should include the user’s name, the restaurant id, the user’s rating, and whatever comments they have. Submitting the form should update the server when the user is online.

**Add functionality to defer updates until the user is connected:**
 
If the user is not online, save the users' data to submit automatically when re-connected. In this case, the review should be deferred and sent to the server when connection is re-established (but the review should still be visible locally even before it gets to the server.)

**Users are able to mark a restaurant as a favorite, this toggle is visible in the application.**

**Meet the new performance requirements:**

In addition to adding new features, the performance targets you met in Stage Two have tightened. Using Lighthouse, you’ll need to measure your site performance against the new targets.

* Progressive Web App score should be at 90 or better.
* Performance score should be at 90 or better.
* Accessibility score should be at 90 or better.

