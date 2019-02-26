import { ModelView } from '../model-view'
import {ProfileService} from "../services/profile-service";
import {UploadService} from "../services/upload-service";
import {PostService} from "../services/post-service";
import {Global} from "../global";
import {Dom7} from "framework7";
import { QueueService } from '../services/queue_service';
import {PromiseView} from "../promise-view";


var $$ = Dom7


class ProfileController {

    loadingInProgress: boolean = false

    constructor(
      private profileService : ProfileService,
      private uploadService : UploadService,
      private postService : PostService,
      private queueService: QueueService
      ) {
        const self = this

        $$(document).on('submit', '#edit-profile-form', function(e) {
            e.preventDefault();
            self.profileEditSave(e)
        })


        $$(document).on('infinite', '#static-profile-infinite-scroll', async function(e) {

          // Exit, if loading in progress
          if (self.loadingInProgress) return;

          self.loadingInProgress = true

          await self.loadStaticProfilePosts(e)

          self.loadingInProgress = false

        })
    }


    async showStaticProfile(id: Number) : Promise<ModelView> {

        let profile: Profile = await this.profileService.getProfileById(id)

        //Show the edit button if this is their profile
        let currentUser: Profile

        try {
          currentUser = await this.profileService.getCurrentUser()
        } catch(ex) {
          console.log("Profile doesn't exist");
        }

        let model = {
          profile: profile,
          showEditLink: (currentUser && currentUser.id == profile.id)
        }

        return new ModelView(model, 'pages/profile/static.html')

    }

    async showProfile() : Promise<ModelView> {

        let profile: Profile;

        try {
          profile = await this.profileService.getCurrentUser()
        } catch(ex) {
          console.log("Profile doesn't exist")
        }

        if (profile) {
          Global.navigate(`/profile/static/${profile.id}`)
        } else {
          return new ModelView({}, 'pages/profile/no_profile.html')
        }

    }

    async showProfileEdit() : Promise<ModelView> {

        let profile: Profile = await this.profileService.getCurrentUser()

        return new ModelView(profile, 'pages/profile/edit.html')

    }

    async profileEditSave(e: Event): Promise<void> {
      try {

        //Collect info
        var profileData: Profile = Global.app.form.convertToData('#edit-profile-form');

        //Add photo (if selected)
        profileData = await this.addProfilePic(profileData)


        //Redirect to home page
        Global.navigate('/')

        //Kick off save sequence
        await this.queueService.queuePromiseView(
          new PromiseView(
            this.profileService.updateProfile(profileData),
            "Saving changes to your profile...",
            "person",
            profileData,
            "/profile/show"
          )
        )

      } catch (ex) {
        Global.showExceptionPopup(ex)
      }

    }




    async loadStaticProfilePosts(e: Event) : Promise<void> {

      let owner = $$('#static-profile-owner').val()

      let currentPosts = $$('#static-profile-post-list').children('li').length

      this.postService.loadMorePosts(
        await this.postService.getPostsByOwner(owner, 10, currentPosts),
        await this.postService.getPostByOwnerCount(owner),
        '#static-profile-post-list'
      )

    }



  /**
   * UTIL
   */


    async addProfilePic(profileData: Profile) : Promise<Profile> {

        //Upload photo if we have it
        const profilePic: HTMLElement = document.getElementById("profilePic");

        //@ts-ignore
        if ((profilePic).files.length > 0) {
          profileData.profilePic = <string> await this.uploadService.uploadFile(profilePic)
        }

        return profileData

    }


}



export { ProfileController }

