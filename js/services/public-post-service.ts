import {Post} from "../dto/post";


class PublicPostService {

  constructor(
    private store: any
  ) {}

  async create(post:Post) : Promise<string> {

    let cid = await this.store.add(post)
    post._id = cid
    return cid 

  }

  async read(cid:string) : Promise<Post> {

    let e = this.store.get(cid)
    let post:Post = e.payload.value
    return post
  }




  async delete(cid:string) : Promise<void> {
    return this.store.remove(cid)
  }




  async getRecentPosts(options) : Promise<Post[]> {

    options.reverse = true
    options.lt = options.before //just want to remember 'before'

    let posts = this.store.iterator(options)
                          .collect()
                          .map((e) => {
                            return e.payload.value
                          }
    )

    posts.reverse()

    return posts

  }






  // async getDescending(limit: number, offset: Number) : Promise<Post[]> {
  //   let posts : Post[] = await this.freedom.readListDescending(POST_REPO, limit, offset)
  //   await this._lazyLoadPosts(posts)

  //   return posts

  // }

  // async getByOwner(owner: string, limit: number, offset: number) : Promise<Post[]> {

  //   let posts : Post[] = await this.freedom.readOwnedListDescending(POST_REPO, owner, limit, offset)

  //   await this._lazyLoadPosts(posts)

  //   return posts

  // }


  // async getCount() : Promise<number> {
  //   return this.freedom.count(POST_REPO)
  // }

  // async getCountByOwner(owner: string) : Promise<number> {
  //   return this.freedom.countOwned(POST_REPO, owner)
  // }



  // async _lazyLoadPosts(posts: Post[]) {
  //   //Fetch authors
  //   for (const post of posts) {
  //     await this._postFetchAuthor(post)
  //   }
  // }


  // async _postFetchAuthor(post: Post) : Promise<void> {
  //   if (post.authorId) {
  //     post.author = await this.profileService.getProfileById(post.authorId)
  //   }
  // }


  getImagesFromPostContentOps(ops : any) {

    const images : string[] = []

    for (let op of ops) {
      if (op.insert && op.insert.ipfsimage) {
        images.push(op.insert.ipfsimage.ipfsCid)
      }
    }

    return images

  }




  // _translatePost(post: Post): void {

  //   //Create content HTML
  //   //@ts-ignore
  //   const qdc = new QuillDeltaToHtmlConverter(post.content.ops, window.opts_ || {
  //   });

  //   //Render dividers into HTML
  //   qdc.renderCustomWith(function(customOp, contextOp) {
  //     if (customOp.insert.type === 'divider') {
  //       return "<hr />"
  //     }

  //     if (customOp.insert.type === 'ipfsimage') {
  //       return `<img src="${Template7.global.ipfsGateway}/${customOp.insert.value.ipfsCid}" width="${customOp.insert.value.width}" height="${customOp.insert.value.height}" style="${customOp.insert.value.style}"  />`
  //     }

  //     if (customOp.insert.type === 'ipfsvideo') {
  //       return `
  //           <video width="${customOp.insert.value.width}" height="${customOp.insert.value.height}" style="${customOp.insert.value.style}">
  //             <source src="${Template7.global.ipfsGateway}/${customOp.insert.value.ipfsCid}" type="video/mp4">
  //           </video>
  //         `
  //     }

  //   })


  //   post.contentTranslated = qdc.convert();

  //   //Convert date
  //   post.dateCreated = new Date(post.dateCreated).toDateString()

  //   //TODO: Probably put max display lengths here somewhere. Since we can't really verify on the way in.


  // }

}


export { PublicPostService }
