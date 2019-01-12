
/** Shortcut methods for localStorage access */
Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}
/*********************************************/

// Dom7
const $$ = Dom7;



let freedom;


//Services
let postService = new PostService();
let profileService = new ProfileService();
let settingsService = new SettingsService();

//Page Controllers
let settingsController = new SettingsController(settingsService);
let homeController = new HomeController();
let profileController = new ProfileController(profileService);
let postController = new PostController(postService, profileService);


//REPO Ids








// Framework7 App main instance
const app = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.testapp', // App bundle ID
  name: 'freedom-for-data Demo', // App name
  theme: 'auto', // Automatic theme detection

  on: {
    init: function () { }
  },

  methods: {
    navigate: function (url) {
      this.view.main.router.navigate(url);
    },

    appendFromTemplate: function (appendTo, templateSelector, viewModel) {
      var template = $$(templateSelector).html();
      var compiledTemplate = Template7.compile(template);

      var html = compiledTemplate(viewModel);

      $$(appendTo).append(html);
    }
  },

  // App routes
  routes: [
    {
      path: '/',
      async async(routeTo, routeFrom, resolve, reject) {

        //Load settings or home page
        let settings = localStorage.getObject("settings");

        Template7.global = {
          settings: settings
        }

        if (!settings) {
          resolve({ url: 'pages/settings.html' })
        } else {

          if (!freedom) {
            freedom = await Freedom({
              ipfsHost: settings.ipfsHost,
              ipfsPort: settings.ipfsPort,
              recordContractAddress: settings.recordContractAddress,
              recordContractTransactionHash: settings.recordContractTransactionHash
            });
          }

          resolve({ url: 'pages/home.html' })

          //If the query param "url" is set that means we want to forward to that page instead
          //A way to make permalinks
          const url = routeTo.query.url;

          if (url) {
            app.router.navigate(url)
          } 

        }
      }
    },
    {
      path: '/settings',
      async async(routeTo, routeFrom, resolve, reject) {
        await settingsController.showSettingsForm(resolve)
      }
    },

    {
      path: '/profile/show',
      async async(routeTo, routeFrom, resolve, reject) {
        await profileController.showProfile(resolve)
      }
    },

    {
      path: '/profile/static/:id',
      async async(routeTo, routeFrom, resolve, reject) {
        await profileController.showStaticProfile(resolve, routeTo.params.id)
      }
    },

    {
      path: '/profile/edit',
      async async(routeTo, routeFrom, resolve, reject) {
        await profileController.showProfileEdit(resolve)
      }
    },
    {
      path: '/profile/create',
      url: 'pages/profile/create.html'
    },

    {
      path: '/post/show/:id',
      async async(routeTo, routeFrom, resolve, reject) {
        await postController.showPost(resolve, routeTo.params.id)
      }
    },

    {
      path: '/post/list',
      async async(routeTo, routeFrom, resolve, reject) {
        await postController.showPostList(resolve)
      }
    },

    {
      path: '/post/create',
      url: 'pages/post/create.html'
    }
  ],

});



// Init/Create main view
const mainView = app.views.create('.view-main', {
  url: '/'
});



function findMatchingRoute(url) {
  
  let matchingRoute = app.router.findMatchingRoute(url); //doesn't have async function for some reason
  
  let path = matchingRoute.route.path


  //Doesn't have the async function we need for some reason. So look up from js object.
  for (route of app.routes) {
    if (route.path == path) {
      matchingRoute = route;
    } 
  }



  return matchingRoute;
}
