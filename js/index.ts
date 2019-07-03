import {Global} from "./global";

const Framework7: any = require('framework7/js/framework7.bundle')
import {Template7} from 'framework7/js/framework7.bundle'
import { RouteService } from "./services/route-service";
import { SettingsService } from "./services/settings-service";
import { QueueService } from "./services/queue_service";
import { TemplateService } from "./services/template-service";
import { SettingsController } from "./controllers/settings-controller";


const moment = require('moment')


module.exports = function() {

  /** Shortcut methods for localStorage access */
  Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
  }

  Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
  }
  /*********************************************/

  Global.settingsService = new SettingsService()
  Global.templateService = new TemplateService()
  Global.queueService = new QueueService(Global.templateService)
  Global.routeService = new RouteService(Global.settingsService)
  Global.settingsController = new SettingsController(Global.settingsService)

  //Template7 helpers
  Template7.registerHelper('shortDate', function(date) {
    return moment(date).format('MMM D, YYYY')
  })


  //Detect page root
  // @ts-ignore
  const rootUrl = new URL(window.location)


  // Framework7 App main instance
  Global.app = new Framework7({
    root: '#app', // App root element
    id: 'io.framework7.testapp', // App bundle ID
    name: 'freedom-for-data Demo', // App name
    theme: 'auto', // Automatic theme detection

    // App routes
    routes: Global.routeService.getRoutes(rootUrl.pathname)

  });


// Init/Create main view
  const mainView = Global.app.views.create('.view-main', {
    pushState: true
  })

}
