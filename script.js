// global flag to easily tell if we're logged in
let loggedIn = false;

// global storyList variable
let storyList;

// global user variable
let user;

// let's see if we're logged in
let token = localStorage.getItem("token");
let username = localStorage.getItem("username");

if (token && username) {
  loggedIn = true;
}



$(document).ready(async function() {
  // cache some selectors we'll be using quite a bit
  const $allStoriesList = $("#all-articles-list");
  const $submitForm = $("#submit-form");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");
  const $newStorySection = $(".new-story-section");
  const $navFavorite = $("#nav-favorite");
  const $allArticlesList = $("#all-articles-list");
  const $favoritedArticles = $("#favorited-articles");
  

  // if there is a token in localStorage, call User.stayLoggedIn
  //  to get an instance of User with the right details
  //  this is designed to run once, on page load
  if (loggedIn) {
    const userInstance = await User.stayLoggedIn();
    // we've got a user instance now
    user = userInstance;
    
    // let's build out some stories
    await generateStories();

    // and then display the navigation

    showNavForLoggedInUser();
    showFavNavForLoggedInUser();
    enableNewStoryForm();
    // addStarLoggedIn();
    
  } else {
    // we're not logged in, let's just generate stories and stop there
    await generateStories();
    //hideAddStory();
  }

  /**
   * Event listener for logging in.
   *  If successfully we will setup the user instance
   */
  $loginForm.on("submit", async function(e) {
    e.preventDefault(); // no page-refresh on submit

    // grab the username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    // set the global user to the user instance
    user = userInstance;
    loggedIn = true;
    loginAndSubmitForm();
    enableNewStoryForm();
    // addStarLoggedIn();
    showFavNavForLoggedInUser();

  });

  /**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */
  $createAccountForm.on("submit", async function(e) {
    e.preventDefault(); // no page refresh

    // grab the required fields
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();

    // call the create method, which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    user = newUser;
    loginAndSubmitForm();
  });

  /**
   * Log Out Functionality
   */
  $navLogOut.on("click", function(e) {
    // empty out local storage
    localStorage.clear();
    // refresh the page, clearing memory
    location.reload();
  });

  /**
   * Event Handler for Clicking Login
   */
  $navLogin.on("click", function() {
    // Show the Login and Create Account Forms
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });

  /**
   * Event handler for Navigation to Homepage
   */
  $("body").on("click", "#nav-all", async function() {
    hideElements();
    await generateStories();
    $allStoriesList.show();
  });

  /**
   * A rendering function to run to reset the forms and hide the login info
   */
  function loginAndSubmitForm() {
    // hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    // reset those forms
    $loginForm.trigger("reset");
    $createAccountForm.trigger("reset");

    // show the stories
    $allStoriesList.show();

    // update the navigation bar
    showNavForLoggedInUser();
  }

  /**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance.
   *  Then render it
   */
  async function generateStories() {
    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();
    // update our global variable
    storyList = storyListInstance;
    // empty out that part of the page
    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    storyList.stories.forEach(function(story) {
      const result = generateStoryHTML(story);
      $allStoriesList.append(result);
    });
  }

  /**
   * A function to render HTML for an individual Story instance
   */

  function generateStoryHTML(story) {
    let hostName = getHostName(story.url);

    // render story markup
    const storyMarkup = $(
      `<li id="${story.storyId}">
        <i class="star"></i>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
           </a>
          <small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-username">posted by ${story.username}</small>
          </li>`
    );

    
    return storyMarkup;
  }

  function generateFavoriteHTML(story) {
    let hostName = getHostName(story.url);

    // render story markup
    const storyMarkup = $(
      `<li id="${story.storyId}">
        <i class="star fa-star fas"></i>
          <a class="article-link" href="${story.url}" target="a_blank">
            <strong>${story.title}</strong>
           </a>
          <small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostName}">(${hostName})</small>
          <small class="article-username">posted by ${story.username}</small>
          </li>`
    );


    return storyMarkup;
  }

  // hide all elements in elementsArr
  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm
    ];
    elementsArr.forEach(val => val.hide());
  }

  function showNavForLoggedInUser() {
    $navLogin.hide();
    $navLogOut.show();
  }

  // simple function to pull the hostname from a URL
  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  //user logged in and wants to create a new story. listen on NewStoryForm for submit to post to backend
  
   $('#NewStoryForm').on("submit", async function(ev) {
      ev.preventDefault();
       const author = $("#new-story-author").val();
       const title = $("#new-story-title").val();
       const url = $("#new-story-URL").val();
      
       let newStory = {
         author,
         title,
         url
       };
      //  console.log(newStory);
      //  console.log("user",user, "newStory", newStory);
       await storyList.addStory(user, newStory);
       await generateStories();
   })

   function enableNewStoryForm(){
    $newStorySection.toggle();
   }

  function showFavNavForLoggedInUser(){
    $navFavorite.toggle();
  }

  function addStarLoggedIn(){

    const $star =$(".star");
    $star.addClass("fa-star far")

  }


  //click on star to select or deselect favorite story
  $allStoriesList.on('click','.fa-star', async function(evt){

    let $eventTarget = $(evt.target);

    //using closest, find story ID of the star
    let storyID = $eventTarget.closest("li").attr("id");

    //check if empty star is clicked => select as favorite
    if($eventTarget.hasClass('far')){
      
      await user.postFavorite(user,storyID); //call post to favorite in database
    }
    // a filled start is clicked => unfavorite
    else if ($eventTarget.hasClass('fas')){
      
      await user.postUnFavorite(user,storyID); //call post to API to deselect favorite 
    }
    //toggle far <-> fas 
    $eventTarget.toggleClass('far fas');
  });

  //FAVORITES :click on star in to select or deselect favorite story
  $favoritedArticles.on('click','.fa-star', async function(evt){

    let $eventTarget = $(evt.target);

    //using closest, find story ID of the star
    let storyID = $eventTarget.closest("li").attr("id");

    //check if empty star is clicked => select as favorite
    if($eventTarget.hasClass('far')){
      
      await user.postFavorite(user,storyID); //call post to favorite in database
      await user.getFavoriteFromUserData(user); 

    }
    // a filled start is clicked => unfavorite
    else if ($eventTarget.hasClass('fas')){
      
      await user.postUnFavorite(user,storyID); //call post to API to deselect favorite 
      await user.getFavoriteFromUserData(user); 
    }
    //toggle far <-> fas 
    $eventTarget.toggleClass('far fas');
  });

  //make nav favorite toggle between all and favorite when clicked
  $navFavorite.on('click', async function(evt){

    let $navTarget = $(evt.target);

    if($navTarget.text() === 'favorite'){
      
      // 1- call the function to GET request to API to pull user information which 
      // includes all favorites
      await user.getFavoriteFromUserData(user); 
      
      // 2- call build HTML function
      $favoritedArticles.empty();
      user.favorites.forEach(function(story) {
      const result = generateFavoriteHTML(story);
      $favoritedArticles.append(result);
    }); 
      // 3- append
      // 4- **** MAKE SURE at refresh favorite stays there (if including showFav in 
      // stay loggede, in, it needs to be careful about what the tag is aa/favorite)
      $allStoriesList.hide();
      $favoritedArticles.show();
      $navFavorite.text('all');
    }
    else if($navTarget.text() === 'all'){
      $allStoriesList.show();

      $favoritedArticles.hide();
      $navFavorite.text('favorite');
    }

  });

});
